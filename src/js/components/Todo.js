import React from "react";

export default class Todo extends React.Component {
  constructor(props) {
    super();
  }

  render() {
    const { complete, edit, text, id} = this.props;
    const icon = complete ? "\u2714" : "\u2716"

    var style = {
      fontWeight: "bold"
    };
    var otherStyle = {
      padding: "0 0 0 5px"
    };

    if (edit) {
      return (
        <li>
          <input value={text} focus="focused"/>
        </li>
      );
    }

    return (
      <li>
        <span style={style}>{text}: {id}</span>
        <span style={otherStyle}>-- {icon}</span>
      </li>
    );
  }
}
