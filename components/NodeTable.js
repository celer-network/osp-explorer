import React, { Component } from 'react';
import { Table, Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export default class NodeTable extends Component {
  onRow = (record) => {
    const { onSelectNode } = this.props;

    return {
      onClick: () => {
        onSelectNode(record);
      },
    };
  };

  getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            this.handleSearch(selectedKeys, confirm, dataIndex)
          }
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={confirm}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),

    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),

    onFilter: (value, record) => {
      if (dataIndex === 'channels') {
        return record[dataIndex].length == value;
      }

      return record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase());
    },

    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },

    render: (text, record) => {
      if (dataIndex === 'rpcHost') {
        return `${text.slice(0, 16)}...`;
      }

      if (dataIndex === 'channels') {
        return record.channels.length;
      }

      return text;
    },
  });

  render() {
    const { nodes } = this.props;
    const pagination = {
      pageSize: Math.floor((window.innerHeight - 200) / 39),
    };

    const columns = [
      {
        title: 'Host',
        dataIndex: 'rpcHost',
        key: 'rpcHost',
        width: '70%',
        ...this.getColumnSearchProps('rpcHost'),
      },
      {
        title: 'Channels',
        dataIndex: 'channels',
        key: 'channels',
        width: '30%',
        ...this.getColumnSearchProps('channels'),
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={Object.values(nodes)}
        size="small"
        onRow={this.onRow}
        pagination={pagination}
      />
    );
  }
}
