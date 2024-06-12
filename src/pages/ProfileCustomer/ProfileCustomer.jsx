import React from 'react';
import axios from 'axios';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import { format } from 'date-fns';
import moment from 'moment';
import 'moment/locale/vi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faKey, faPencil, faTableList, faUser } from '@fortawesome/free-solid-svg-icons';

import VTICKET_API_SERVICE_INFOS from '../../configs/api_infos'
import { APP_ENV } from "../../configs/app_config"
import './ProfileCustomer.css'
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Alert, Form, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function ProfileCustomer() {
  const [errors, setErrors] = React.useState([]);
  const [subscriptionStatus, setSubscriptionStatus] = React.useState(true);
  const [changedInfo, setChangedInfo] = React.useState(false);
  const [changedPass, setChangedPass] = React.useState(false);

  const [changedIndex, setChangedIndex] = React.useState(0);
  const [taskName, setTaskName] = React.useState("infor");

  const [firstName, setFirstName] = React.useState(localStorage.getItem('first_name'));
  const [lastName, setLastName] = React.useState(localStorage.getItem('last_name'));
  const [avatarUrl, setAvatarUrl] = React.useState(localStorage.getItem('avatar_url'));
  const [gender, setGender] = React.useState(localStorage.getItem('gender'));
  const [birthday, setBirthday] = React.useState(localStorage.getItem('birthday'));
  const email = localStorage.getItem('email');
  const [phoneNumber, setPhoneNumber] = React.useState(localStorage.getItem('phone_number'));

  React.useEffect(()=>{
    setFirstName(localStorage.getItem('first_name'));
    setLastName(localStorage.getItem('last_name'));
    setAvatarUrl(localStorage.getItem('avatar_url'));
    setGender(localStorage.getItem('gender'));
    setBirthday(localStorage.getItem('birthday'));
    setPhoneNumber(localStorage.getItem('phone_number'));
  },[changedIndex]);

  const [accountInfo, setAccountInfo] = React.useState({
    first_name: firstName,
    last_name: lastName,
    gender: gender,
    birthday: birthday ,
    phone_number: phoneNumber,
    avatar_url : avatarUrl
  });
  
  const [changePass, setChangePass] = React.useState({
    old_password: "",
    new_password: "",
  });

  const [avatarURL,setAvatarURL] = React.useState(accountInfo.avatar_url);

  const [tickets, setTickets] = React.useState([]);


  const handleChange = (event) => {
    setErrors([]);
    const { name, value } = event.target;

    setAccountInfo((prevalue) => {
      return {
        ...prevalue,
        [name]: value
      }
    })
  }

  const handleChangePass = (event) => {
    setErrors([]);
    const { name, value } = event.target;

    setChangePass((prevalue) => {
      return {
        ...prevalue,
        [name]: value
      }
    })
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    axios({
      method: 'post',
      url: `${VTICKET_API_SERVICE_INFOS.account[APP_ENV].domain}/profile/avatar`,
      data: {image: formData.get("file")},
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(function (response) {
        if (response.data.status === 1) {
            setAvatarURL(response.data.data.avatar_url)
        } else {
            setErrors(...errors, response.data.message);
        }
    })
    .catch(function (error) {
            setErrors(...errors, error);
    });
  };

  const handleDateChange = (date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    const onlyFormattedDate = new Date(formattedDate).toISOString().split('T')[0];
    setAccountInfo((prevValue) => ({
      ...prevValue,
      birthday: onlyFormattedDate
    }));
  }

  const isValidDate = (currentDate) => {
    const selectedDate = currentDate.toDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 for comparison
    return selectedDate <= today;
  };

  const phoneRegex = /^\+?(\d{1,3})?[-.\s]?(\(?\d{1,4}\)?)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;

  function validatePhoneNumber(phoneNumber) {
    return phoneRegex.test(phoneNumber);
  }

  const handleSubmit = () => {
    const newErrors = {};
    setErrors([]);
    if (!accountInfo.first_name) {
      newErrors["first_name"] = "Họ không được trống";
    }

    if (!accountInfo.last_name) {
      newErrors["last_name"] = "Tên không được trống";
    }

    if (!accountInfo.birthday) {
      newErrors["birthday"] = "Ngày sinh không được trống";
    }

    if (!accountInfo.gender) {
      newErrors["gender"] = "Giới tính không được để trống";
    };

    if (!validatePhoneNumber(accountInfo.phone_number)) {
      newErrors["phone_number"] = "Số điện thoại không hợp lệ";
    };

    if (Object.keys(newErrors).length !== 0) {
      setErrors(newErrors);
      return;
    }
    else {
      axios.patch(`${VTICKET_API_SERVICE_INFOS.account[APP_ENV].domain}/profile/me`, {
        first_name: accountInfo.first_name,
        last_name: accountInfo.last_name,
        gender: accountInfo.gender,
        birthday: accountInfo.birthday,
        phone_number: accountInfo.phone_number
      })
        .then(function (response) {
          if (response.data.status === 1) {
            localStorage.setItem("first_name", accountInfo.first_name);
            localStorage.setItem("last_name", accountInfo.last_name);
            localStorage.setItem("gender", accountInfo.gender);
            localStorage.setItem("birthday", accountInfo.birthday);
            localStorage.setItem("phone_number", accountInfo.phone_number);
            localStorage.setItem("avatar_url", avatarURL);
            setAccountInfo((prevValue) => ({
              ...prevValue,
              avatar_url: avatarURL,
            }));
            setChangedIndex((prev) => prev + 1);
            setChangedInfo(true);
            setTimeout(() => {
              setChangedInfo(false);
            }, 1500);
          } else {
            newErrors["change_info"] = response.data.message;
            setErrors(newErrors);
          }
        })
        .catch(function (error) {
          newErrors["error"] = error.message;
          setErrors(newErrors);
        });
    }
  }

  const handleSwitchChange = () =>{
    const newErrors = {};
    axios.get(`${VTICKET_API_SERVICE_INFOS.event[APP_ENV].domain}/subcription/me/change-status`, {
    })
      .then(function (response) {
        if (response.data.status === 1) {
          setSubscriptionStatus(!subscriptionStatus);
        } else {
          newErrors["change_status"] = response.data.message;
          setErrors(newErrors);
        }
      })
      .catch(function (error) {
        newErrors["error"] = error.message;
        setErrors(newErrors);
      });
  }

  React.useEffect(()=>{
    axios.get(`${VTICKET_API_SERVICE_INFOS.event[APP_ENV].domain}/subcription/me/status`, {
    })
      .then(function (response) {
        if (response.data.status === 1) {
          setSubscriptionStatus(response.data.data.is_enable);
        } else {
          setErrors((prev) => ({...prev,"get_status": response.data.message}));
        }
      });
    
    axios.get(`${VTICKET_API_SERVICE_INFOS.event[APP_ENV].domain}/ticket/filter`, {
    })
      .then(function (response) {
        if (response.data.status === 1) {
          setTickets(response.data.data);
        } else {
          setErrors((prev) => ({...prev,"get_tickets": response.data.message}));
        }
      });

  },[])

  const handleSubmitChangePass = () => {
    const newErrors = {};
    setErrors([]);
    if (!changePass.old_password) {
      newErrors["old_password"] = "Mật khẩu cũ không được trống";
    }

    if (!changePass.new_password) {
      newErrors["new_password"] = "Mật khẩu mới không được trống";
    }

    if (Object.keys(newErrors).length !== 0) {
      setErrors(newErrors);
      return;
    }
    else {
      axios({
        method: 'post',
        url: `${VTICKET_API_SERVICE_INFOS.account[APP_ENV].domain}/account/change-password`,
        data: {
          old_password: changePass.old_password,
          new_password: changePass.new_password,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(function (response) {
          if (response.data.status === 1) {
            setChangedPass(true);
            setTimeout(() => {
              setChangedPass(false);
            }, 1500);
            setChangePass({
              "old_password":"",
              "new_password":"",
            })
          } else {
            newErrors["change_pass"] = response.data.message;
            setErrors(newErrors);
          }
        })
        .catch(function (error) {
          newErrors["error"] = error.message;
          setErrors(newErrors);
        });
    }
  }

  return (
    <div className="Profile_customer__wrapper">
      <Header />
      <div className="Profile_customer">
        <div className="Profile_customer__sidebar">
          <div className="Sidebar__avt_name">
            <img src={accountInfo.avatar_url !== 'null' ? accountInfo.avatar_url : "/assets/images/avatar_default.png"} alt="User Avatar" className="Sidebar_avt" />
            <h2 className="Sidebar__name">{lastName} {firstName}</h2>
          </div>
          <ul class="Sidebar__menu">
            <li class={taskName === 'infor' ? "Sidebar__menu--item_active" : "Sidebar__menu--item"} onClick={()=>setTaskName('infor')}>
              <FontAwesomeIcon icon={faUser} className="task_icon" />
              Thông tin cá nhân
            </li>
            <li class={taskName === 'ticket management' ? "Sidebar__menu--item_active" : "Sidebar__menu--item"} onClick={()=>setTaskName('ticket management')}>
              <FontAwesomeIcon icon={faTableList} className="task_icon" />
              Quản lý vé
            </li>
            <li class={taskName === 'change password' ? "Sidebar__menu--item_active" : "Sidebar__menu--item"} onClick={()=>setTaskName('change password')}>
              <FontAwesomeIcon icon={faKey} className="task_icon" />
              Thay đổi mật khẩu
            </li>
            {/* <Link to='/reset-password' class={taskName === 'change password' ? "Sidebar__menu--item_active" : "Sidebar__menu--item"} onClick={()=>setTaskName('change password')}>
              <FontAwesomeIcon icon={faArrowsRotate} className="task_icon" />
              Đặt lại mật khẩu
            </Link> */}
          </ul>
          <div class="Subscription_btn">
            Nhận thông tin mới nhất
            <Form.Check
              type="switch"
              id="custom-switch"
              checked={subscriptionStatus}
              onChange={handleSwitchChange}
            /> 
          </div>
        </div>
        {taskName === 'infor' && <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className='Profile_customer__form'>
          <h2 className="Profile_customer__infor_input--title">Thông tin cá nhân</h2>    
          <div className="Profile_customer__infor_input">
            <div className='Profile_customer__avatar'>
              <img src={avatarURL !== 'null' ? avatarURL : "/assets/images/avatar_default.png"} alt="User Avatar" className="form_avt" />
              <label htmlFor="avatarInput" style={{ cursor: 'pointer' }} className='import_file_avatar'>
                <input
                  id="avatarInput"
                  type="file"
                  name='image'
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <FontAwesomeIcon icon={faPencil} className='iconPencil'/>
              </label>
              {/* <button className="update_avatar" onClick={handleChangeAvatar}>Đổi ảnh đại diện</button> */}
            </div>
            <div className="Profile_customer_form__full_name">
              <div className="form_first_name">
                <label htmlFor="first_name" className='Profile_customer_form__label'>Họ</label>
                <input
                  type="text"
                  id="first_name"
                  value={accountInfo.first_name}
                  name="first_name"
                  className={errors.first_name ? "Profile_customer_form__input_name error-input" : "Profile_customer_form__input_name normal-input"}
                  onChange={handleChange} />
                {errors["first_name"] && <span className="error">{errors["first_name"]}</span>}
              </div>
              <div className="form_last_name">
                <label htmlFor="last_name" className='Profile_customer_form__label'>Tên</label>
                <input
                  type="text"
                  id="last_name"
                  value={accountInfo.last_name}
                  name="last_name"
                  className={errors.last_name ? "Profile_customer_form__input_name error-input" : "Profile_customer_form__input_name normal-input"}
                  onChange={handleChange}
                />
                {errors["last_name"] && <span className="error">{errors["last_name"]}</span>}
              </div>
            </div>
            <label htmlFor="email" className='Profile_customer_form__label'>Email</label>
            <input
              type="text"
              id="email"
              value={email}
              readOnly
              disabled
              className="Profile_customer_form__input normal-input disable"
            />
            <label htmlFor="gender" className='Profile_customer_form__label'>Giới tính</label>
            <select
              name="gender"
              className='Profile_customer_form__input'
              value={accountInfo.gender}
              onChange={handleChange} >
              <option value="1">Nam</option>
              <option value="0">Nữ</option>
              <option value="-1">Riêng tư</option>
            </select>
            <label htmlFor="birthday" className='Profile_customer_form__label'>Ngày sinh</label>
            <Datetime
              id="birthday"
              value={format(accountInfo.birthday, "dd-MM-yyyy")}
              onChange={handleDateChange}
              dateFormat="DD-MM-YYYY"
              timeFormat={false}
              locale="vi"
              closeOnSelect={true}
              renderMonth={(props, month) => <td {...props}>Thg {month + 1}</td>}
              placeholderText="Chọn ngày sinh"
              isValidDate={isValidDate}
              className={errors.birthday ? "Profile_customer_form__input_date error-input" : "Profile_customer_form__input_date normal-input"}
            />
            {errors["birthday"] && <span className="error">{errors["birthday"]}</span>}
            <label htmlFor="phone_number" className='Profile_customer_form__label'>SĐT</label>
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              value={accountInfo.phone_number !== 'null' ? accountInfo.phone_number : ''}
              onChange={handleChange}
              className={errors.phone_number ? "Profile_customer_form__input error-input" : "Profile_customer_form__input normal-input"} />
            {errors["phone_number"] && <span className="error">{errors["phone_number"]}</span>}
            {changedInfo && <span className="successful">
              Cập nhật thông tin tài khoản thành công!
            </span>}
            <button className='Profile_customer__form--submit_btn' onClick={handleSubmit}>Lưu</button>
          </div>
        </form>}
        {taskName === 'ticket management' && <div className="Customer_ticket_management">
          <h2 className="Profile_customer__infor_input--title">Danh sách vé</h2> 
          <Table striped bordered hover>
            <thead>
              <tr>
                <th className="stt">STT</th>
                <th>Số ghế</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tickets !== null && tickets.map((ticket, index) => {
                return (
                  <tr key={index}>
                    <td className="stt">{index}</td>
                    <td>{ticket?.seat}</td>
                    <td>
                      <Link to={`/event-detail/${ticket.event_id}?feedbackable=true`} className='Feedback_btn'>Đánh giá sự kiện</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div> }
        {taskName === 'change password' && <div className="Customer_change_password">
          <h2 className="Profile_customer__infor_input--title">Thay đổi mật khẩu</h2> 
          <div className="Profile_customer__old_password">
            <label htmlFor="old_password" className='Profile_customer_form__label'>Mật khẩu cũ</label>
            <input
              type="password"
              id="old_password"
              value={changePass.old_password}
              name="old_password"
              placeholder='Mật khẩu cũ...'
              className={errors.old_password ? "Profile_customer_form__input error-input" : "Profile_customer_form__input normal-input"}
              onChange={(e) => handleChangePass(e)}
              autoComplete= "new-password"/>
            {errors["old_password"] && <span className="error">{errors["old_password"]}</span>}
          </div>
          <div className="Profile_customer__old_password">
            <label htmlFor="new_password" className='Profile_customer_form__label'>Mật khẩu mới</label>
            <input
              type="password"
              id="new_password"
              value={changePass.new_password}
              name="new_password"
              placeholder='Mật khẩu mới...'
              className={errors.new_password ? "Profile_customer_form__input error-input" : "Profile_customer_form__input normal-input"}
              onChange={(e) => handleChangePass(e)} 
              autoComplete= "new-password"/>
            {errors["new_password"] && <span className="error">{errors["new_password"]}</span>}
          </div>
          {errors["change_pass"] && <span className="error">{errors["change_pass"]}</span>}
          {changedPass && <span className="successful">
              Thay đổi mật khẩu tài khoản thành công!
            </span>}
          <button className='Profile_customer__form--submit_btn' onClick={handleSubmitChangePass}>Đổi mật khẩu</button>
        </div> }
      </div>
      <Footer />
    </div>
  );
}

export default ProfileCustomer;