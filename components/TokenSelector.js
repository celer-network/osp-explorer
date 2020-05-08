import { Card, Select } from "antd";

const { Option } = Select;

export default function TokenSelector(props) {
  const { tokens, onChange, selectedToken } = props;

  return (
    <Card type="inner" size="small" title="Channel Token Type">
      <Select
        style={{ width: "100%" }}
        value={selectedToken}
        onChange={onChange}
      >
        {tokens.map((token) => (
          <Option key={token.address} value={token.address}>
            {token.name}({token.address})
          </Option>
        ))}
      </Select>
    </Card>
  );
}
