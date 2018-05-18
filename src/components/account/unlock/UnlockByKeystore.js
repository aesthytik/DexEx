import React from 'react';
import {Upload, Button, Input, Icon, Form} from 'antd';
import routeActions from 'common/utils/routeActions'
import Notification from '../../../common/loopringui/components/Notification'
import {isKeystorePassRequired} from "LoopringJS/ethereum/keystore";


class Keystore extends React.Component {

  state = {
    fileList: [],
    visible: false
  };

  beforeUpload = (file) => {
    const keyStoreModel = this.props.keystore;
    const {form} = this.props;
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const keystore = fileReader.result;
      keyStoreModel.setKeystore({keystore});
      form.setFieldsValue({keystore: keystore.toString()})
    };
    fileReader.readAsText(file, "utf-8");
    this.setState({fileList: []});
    return false;
  };

  handleStoreChange = (e) => {
    const keyStoreModel = this.props.keystore;
    const keystore = e.target.value;
    keyStoreModel.setKeystore({keystore});
  };

  unlock = () => {
    const keyStoreModel = this.props.keystore;
    const {keystore, isPasswordRequired, password} = keyStoreModel;
    if (this.isValidKeystore(keystore)) {
      if ((isPasswordRequired && password) || !isPasswordRequired) {
        this.props.dispatch({
          type: 'wallet/unlockKeyStoreWallet', payload: {
            keystore, password, cb: (e) => {
              if (!e) {
                Notification.open({type: 'success', message: '解锁成功', description: 'unlock'});
                keyStoreModel.reset();
                routeActions.gotoPath('/wallet');
              } else {
                Notification.open({type: 'error', message: '解锁失败', description: e.message});
              }
            }
          }
        });
      }
    }
  };

  handlePassChange = (e) => {
    const password = e.target.value;
    const keyStoreModel = this.props.keystore;
    keyStoreModel.setPassword({password})
  };
  togglePassword = () => {
    const {visible} = this.state;
    this.setState({visible: !visible})
  };

  isValidKeystore = (keystore) => {
    try {
      isKeystorePassRequired(keystore);
      return true;
    } catch (e) {
      console.log('ERROR:', e.message);
      return false;
    }
  };

  render() {
    const keyStoreModel = this.props.keystore;
    const {isPasswordRequired, password} = keyStoreModel;
    const {fileList, visible} = this.state;
    const {form} = this.props;
    const uploadProps = {
      action: '',
      beforeUpload: this.beforeUpload,
      fileList
    };

    const visibleIcon = (
      <div className="fs14 pl5 pr5">
        {visible &&
        <i className="icon-eye" onClick={this.togglePassword}/>
        }
        {!visible &&
        <i className="icon-eye-slash" onClick={this.togglePassword}/>
        }
      </div>
    );

    return (
      <div>
        <h2 className="text-center text-primary">Select JSON File</h2>
        <Upload className='btn btn-block' {...uploadProps}>
          <Button><Icon type="folder"/>Select JSON File</Button>
        </Upload>
        <div className="blk"/>
        <Form>
          <Form.Item className="form-dark">
            {form.getFieldDecorator('keystore', {
              initialValue: '',
              rules: [{
                required: true,
                message: 'invalid keystore',
                validator: (rule, value, cb) => this.isValidKeystore(value) ? cb() : cb(true)
              }]
            })(
              <Input.TextArea autosize={{minRows: 3, maxRows: 8}} size="large" className='d-block fs12'
                              onChange={this.handleStoreChange}/>
            )}
          </Form.Item>
        </Form>
        {isPasswordRequired &&
        <Input type={visible ? 'text' : 'password'} className='mb10' addonAfter={visibleIcon} value={password}
               onChange={this.handlePassChange}/>}
        <div className="blk"/>
        <Button type="primary" className="btn btn-primary btn-block btn-xxlg" onClick={this.unlock}>Unlock</Button>
      </div>
    )
  }
}

export default Form.create()(Keystore)






