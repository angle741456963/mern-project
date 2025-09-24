const router = require("express").Router();
const Course = require("../models").course;
const courseValidation = require("../validation").courseValidation;

router.use((req, res, next) => {
  console.log("正在接收課程");
  next();
});

//獲得系統中所有課程
router.get("/", async (req, res) => {
  try {
    let courseFound = await Course.find({})
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//利用講師id尋找課程
router.get("/instructor/:instructor_id", async (req, res) => {
  let { instructor_id } = req.params;
  let coursesFound = await Course.find({ instructor: instructor_id })
    .populate("instructor", ["username", "email"])
    .exec();

  return res.send(coursesFound);
});

//利用學生id尋找註冊過的課程
router.get("/student/:_student_id", async (req, res) => {
  try {
    let { _student_id } = req.params;
    let coursesFound = await Course.find({ students: _student_id })
      .populate("instructor", ["username", "email"])
      .exec();

    return res.send(coursesFound);
  } catch (e) {
    return res.send(e);
  }
});

//利用課程名稱尋找課程
router.get("/findByName/:name", async (req, res) => {
  let { name } = req.params;
  try {
    let courseFound = await Course.find({ title: name })
      .populate("instructor", ["email", "username"])
      .exec();

    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//利用課程id尋找課程
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id })
      .populate("inctructor", ["email"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//新增課程
router.post("/", async (req, res) => {
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.user.isStudent()) {
    return res.status(400).send("只有講師才能開課");
  }

  let { title, description, price } = req.body;
  try {
    let newCourse = new Course({
      title,
      description,
      price,
      instructor: req.user._id,
    });
    let savedCourse = await newCourse.save();
    return res.send({
      msg: "開課成功",
      savedCourse,
    });
  } catch (e) {
    return res.status(500).send("無法開課");
  }
});

//註冊課程
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let course = await Course.findOne({ _id }).exec();
    course.students.push(req.user._id);
    // course.students.map((student) => {
    //   if (student == req.user._id) {
    //     console.log("已註冊");
    //     return res.send("已註冊");
    //   } else {

    //   }
    // });

    await course.save();
    return res.send("註冊完成");
  } catch (e) {
    return res.send(e);
  }
});

//更改課程
router.patch("/:_id", async (req, res) => {
  //驗證身份
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let { _id } = req.params;
  //確認課程是否存在
  try {
    let courseFound = await Course.findOne({ _id });
    if (!courseFound) {
      return res.status(500).send("找不到課程");
    }

    //使用者必須是課程講師
    if (courseFound.instructor.equals(req.user._id)) {
      let updatedCourse = await Course.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidation: true,
      });
      return res.send({
        msg: "課程更新成功",
        updatedCourse,
      });
    } else {
      return res.status(403).send("只有此課程講師可以更改課程內容");
    }
  } catch (e) {
    return res.send(e);
  }
});

//刪除課程
router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id });
    if (!courseFound) {
      return res.status(500).send("找不到課程");
    }

    //使用者必須是課程講師
    if (courseFound.instructor.equals(req.user._id)) {
      await Course.deleteOne({ _id }).exec();
      return res.send("課程刪除成功");
    } else {
      return res.status(403).send("只有此課程講師可以刪除課程內容");
    }
  } catch (e) {
    return res.send(e);
  }
});

module.exports = router;
