import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseService from "../services/course.service";

const EnrollComponent = (props) => {
  let { currentUser, setCurrentUser } = props;
  const navigate = useNavigate();
  let [searchInput, setSearchInput] = useState("");
  let [searchResult, setSearchResult] = useState(null);
  let [message, setMessage] = useState("");
  let [enrolled, setEnrolled] = useState(false);
  let _id;
  const handleTakeToLogin = () => {
    navigate("/login");
  };

  const handleChangeInput = (e) => {
    setSearchInput(e.target.value);
  };

  const check = (course) => {
    _id = currentUser.user._id;
    if (course.students.length == 0) {
      setEnrolled(false);
    }
    for (let i = 0; i < course.students.length; i++) {
      if (course.students[i] == _id) {
        setEnrolled(true);
      } else {
        setEnrolled(false);
      }
    }
  };

  const handleSearch = () => {
    CourseService.getCourseByName(searchInput)
      .then((data) => {
        if (data.data.length == 0) {
          setMessage("找不到課程！請確認名稱是否有誤！");
          setSearchResult(null);
        } else {
          setSearchResult(data.data);
          setMessage("");
          check(data.data[0]);
        }
      })
      .catch((e) => {
        setMessage(e.response.data);
      });
  };

  const handleEnroll = (e) => {
    CourseService.enroll(e.target.id)
      .then(() => {
        window.alert("課程註冊成功！");
        navigate("/course");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div style={{ padding: "3rem" }}>
      {message && <div className="alert alert-danger">{message}</div>}
      {!currentUser && (
        <div>
          <p>要先登入才能查詢課程。</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleTakeToLogin}
          >
            回到登入頁面
          </button>
        </div>
      )}
      {currentUser && currentUser.user.role == "instructor" && (
        <div>
          <h1>只有學生才能註冊課程！</h1>
        </div>
      )}
      {currentUser && currentUser.user.role == "student" && (
        <div className="search input-group mb-3">
          <input
            onChange={handleChangeInput}
            type="text"
            className="form-control"
          />
          <button onClick={handleSearch} className="btn btn-primary">
            搜尋課程
          </button>
        </div>
      )}
      {currentUser && searchResult && searchResult.length != 0 && (
        <div>
          <p>我們從 API 返回的數據：</p>
          {searchResult.map((course) => {
            return (
              <div key={course._id} className="card" style={{ width: "18rem" }}>
                <div className="card-body">
                  <h5 className="card-title">課程名稱：{course.title}</h5>
                  <p className="card-text">{course.description}</p>
                  <p>價格: {course.price}</p>
                  <p>講師：{course.instructor.username}</p>
                  <p>目前的學生人數: {course.students.length}</p>
                  {!enrolled && (
                    <a
                      href="#"
                      onClick={handleEnroll}
                      className="card-text btn btn-primary"
                      id={course._id}
                    >
                      註冊課程
                    </a>
                  )}
                  {enrolled && (
                    <p
                      style={{
                        fontSize: "1.5rem",
                        color: "red",
                      }}
                    >
                      已註冊
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EnrollComponent;
