import { useState } from "react";
import { Form, Button, Input, List, Spin, message, Tag, Space } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import axios from "axios";

const { TextArea } = Input;

enum MessageType {
  User,
  AI,
}

interface IMessage {
  messageType: MessageType;
  content: string;
}

function App() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<IMessage[]>([]);

  const pushMessage = (prompt: string, isAI?: boolean) =>
    setList((list) => [
      ...list,
      {
        content: prompt,
        messageType: isAI ? MessageType.AI : MessageType.User,
      },
    ]);

  const onReset = (clearList?: boolean) => {
    form.resetFields();
    clearList && setList([]);
  };

  const handleSubmit = async ({ prompt }: { prompt: string }) => {
    pushMessage(prompt);

    try {
      setLoading(true);
      onReset();
      const { data: aiMessage } = await axios.get(
        "https://mmc-cloud.up.railway.app/api/chat",
        {
          params: { prompt },
        }
      );
      pushMessage(aiMessage, true);
    } catch (error) {
      message.error("api 出错 请联系毛毛虫");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <List
        style={{ height: "100vh" }}
        footer={
          <>
            {loading && (
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              />
            )}
            <Form
              form={form}
              initialValues={{ remember: true }}
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Form.Item
                name="prompt"
                rules={[
                  { required: true, message: "Please input your message!" },
                ]}
              >
                <TextArea rows={4} />
              </Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  发送
                </Button>
                <Button htmlType="button" onClick={() => onReset(true)}>
                  重置
                </Button>
              </Space>
            </Form>
          </>
        }
        bordered
        dataSource={list}
        renderItem={(item, index) => {
          const isAi = item.messageType === MessageType.AI;
          return (
            <List.Item key={index}>
              <Tag color={isAi ? "success" : "error"}>
                {isAi ? "AI" : "YOU"}:{" "}
              </Tag>
              {item.content}
            </List.Item>
          );
        }}
      />
    </div>
  );
}

export default App;
