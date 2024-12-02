// import Faculty from "../models/faculty.js";
// import Test from "../models/test.js";
// import Student from "../models/student.js";
// import Subject from "../models/subject.js";
// import Marks from "../models/marks.js";
// import Attendence from "../models/attendance.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sql from 'mssql';
import { sqlConfig } from "../index.js";


// export const facultyLogin = async (req, res) => {
//   const { username, password } = req.body;
//   const errors = { usernameError: String, passwordError: String };
//   try {
//     const existingFaculty = await Faculty.findOne({ username });
//     if (!existingFaculty) {
//       errors.usernameError = "Faculty doesn't exist.";
//       return res.status(404).json(errors);
//     }
//     const isPasswordCorrect = await bcrypt.compare(
//       password,
//       existingFaculty.password
//     );
//     if (!isPasswordCorrect) {
//       errors.passwordError = "Invalid Credentials";
//       return res.status(404).json(errors);
//     }

//     const token = jwt.sign(
//       {
//         email: existingFaculty.email,
//         id: existingFaculty._id,
//       },
//       "sEcReT",
//       { expiresIn: "1h" }
//     );

//     res.status(200).json({ result: existingFaculty, token: token });
//   } catch (error) {
//     console.log(error);
//   }
// };
export const facultyLogin = async (req, res) => {
  const { username, password } = req.body;
  const errors = { usernameError: '', passwordError: '' };
  
  try {
    const pool =    await sql.connect(sqlConfig);
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM Faculty WHERE username = @username');
    
    const existingFaculty = result.recordset[0];
    
    if (!existingFaculty) {
      errors.usernameError = "Faculty doesn't exist.";
      return res.status(404).json(errors);
    }
    
    const isPasswordCorrect = await bcrypt.compare(password, existingFaculty.password);
    
    if (!isPasswordCorrect) {
      errors.passwordError = "Invalid Credentials";
      return res.status(404).json(errors);
    }

    const token = jwt.sign(
      {
        email: existingFaculty.email,
        id: existingFaculty.id,
      },
      "sEcReT",
      { expiresIn: "1h" }
    );

    res.status(200).json({ result: existingFaculty, token: token });
  } catch (error) {
    console.log("Error in facultyLogin:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// export const updatedPassword = async (req, res) => {
//   try {
//     const { newPassword, confirmPassword, email } = req.body;
//     const errors = { mismatchError: String };
//     if (newPassword !== confirmPassword) {
//       errors.mismatchError =
//         "Your password and confirmation password do not match";
//       return res.status(400).json(errors);
//     }

//     const faculty = await Faculty.findOne({ email });
//     let hashedPassword;
//     hashedPassword = await bcrypt.hash(newPassword, 10);
//     faculty.password = hashedPassword;
//     await faculty.save();
//     if (faculty.passwordUpdated === false) {
//       faculty.passwordUpdated = true;
//       await faculty.save();
//     }

//     res.status(200).json({
//       success: true,
//       message: "Password updated successfully",
//       response: faculty,
//     });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };

// export const updateFaculty = async (req, res) => {
//   try {
//     const { name, dob, department, contactNumber, avatar, email, designation } =
//       req.body;
//     const updatedFaculty = await Faculty.findOne({ email });
//     if (name) {
//       updatedFaculty.name = name;
//       await updatedFaculty.save();
//     }
//     if (dob) {
//       updatedFaculty.dob = dob;
//       await updatedFaculty.save();
//     }
//     if (department) {
//       updatedFaculty.department = department;
//       await updatedFaculty.save();
//     }
//     if (contactNumber) {
//       updatedFaculty.contactNumber = contactNumber;
//       await updatedFaculty.save();
//     }
//     if (designation) {
//       updatedFaculty.designation = designation;
//       await updatedFaculty.save();
//     }
//     if (avatar) {
//       updatedFaculty.avatar = avatar;
//       await updatedFaculty.save();
//     }
//     res.status(200).json(updatedFaculty);
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };

// export const createTest = async (req, res) => {
//   try {
//     const { subjectCode, department, year, section, date, test, totalMarks } =
//       req.body;
//     const errors = { testError: String };
//     const existingTest = await Test.findOne({
//       subjectCode,
//       department,
//       year,
//       section,
//       test,
//     });
//     if (existingTest) {
//       errors.testError = "Given Test is already created";
//       return res.status(400).json(errors);
//     }

//     const newTest = await new Test({
//       totalMarks,
//       section,
//       test,
//       date,
//       department,
//       subjectCode,
//       year,
//     });

//     await newTest.save();
//     const students = await Student.find({ department, year, section });
//     return res.status(200).json({
//       success: true,
//       message: "Test added successfully",
//       response: newTest,
//     });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };

// export const getTest = async (req, res) => {
//   try {
//     const { department, year, section } = req.body;

//     const tests = await Test.find({ department, year, section });

//     res.status(200).json({ result: tests });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };

// export const getStudent = async (req, res) => {
//   try {
//     const { department, year, section } = req.body;
//     const errors = { noStudentError: String };
//     const students = await Student.find({ department, year, section });
//     if (students.length === 0) {
//       errors.noStudentError = "No Student Found";
//       return res.status(404).json(errors);
//     }

//     res.status(200).json({ result: students });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };

// export const uploadMarks = async (req, res) => {
//   try {
//     const { department, year, section, test, marks } = req.body;

//     const errors = { examError: String };
//     const existingTest = await Test.findOne({
//       department,
//       year,
//       section,
//       test,
//     });
//     const isAlready = await Marks.find({
//       exam: existingTest._id,
//     });

//     if (isAlready.length !== 0) {
//       errors.examError = "You have already uploaded marks of given exam";
//       return res.status(400).json(errors);
//     }

//     for (var i = 0; i < marks.length; i++) {
//       const newMarks = await new Marks({
//         student: marks[i]._id,
//         exam: existingTest._id,
//         marks: marks[i].value,
//       });
//       await newMarks.save();
//     }
//     res.status(200).json({ message: "Marks uploaded successfully" });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };

// export const markAttendance = async (req, res) => {
//   try {
//     const { selectedStudents, subjectName, department, year, section } =
//       req.body;

//     const sub = await Subject.findOne({ subjectName });

//     const allStudents = await Student.find({ department, year, section });

//     for (let i = 0; i < allStudents.length; i++) {
//       const pre = await Attendence.findOne({
//         student: allStudents[i]._id,
//         subject: sub._id,
//       });
//       if (!pre) {
//         const attendence = new Attendence({
//           student: allStudents[i]._id,
//           subject: sub._id,
//         });
//         attendence.totalLecturesByFaculty += 1;
//         await attendence.save();
//       } else {
//         pre.totalLecturesByFaculty += 1;
//         await pre.save();
//       }
//     }

//     for (var a = 0; a < selectedStudents.length; a++) {
//       const pre = await Attendence.findOne({
//         student: selectedStudents[a],
//         subject: sub._id,
//       });
//       if (!pre) {
//         const attendence = new Attendence({
//           student: selectedStudents[a],
//           subject: sub._id,
//         });

//         attendence.lectureAttended += 1;
//         await attendence.save();
//       } else {
//         pre.lectureAttended += 1;
//         await pre.save();
//       }
//     }
//     res.status(200).json({ message: "Attendance Marked successfully" });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };

export const updatedPassword = async (req, res) => {
  const { newPassword, confirmPassword, email } = req.body;
  const errors = { mismatchError: '' };

  if (newPassword !== confirmPassword) {
    errors.mismatchError = "Your password and confirmation password do not match";
    return res.status(400).json(errors);
  }

  try {
    const pool =   await sql.connect(sqlConfig);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .query('UPDATE Faculty SET password = @password, passwordUpdated = 1 WHERE email = @email');

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log("Error in updatedPassword:", error);
    res.status(500).json({ backendError: 'Internal server error' });
  }
};
export const updateFaculty = async (req, res) => {
  const { name, dob, department, contactNumber, avatar, email, designation } = req.body;

  try {
    const pool =   await sql.connect(sqlConfig);

    const query = 'UPDATE Faculty SET name = @name, dob = @dob, department = @department, contactNumber = @contactNumber, avatar = @avatar, designation = @designation WHERE email = @email';
    
    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('dob', sql.NVarChar, dob)
      .input('department', sql.NVarChar, department)
      .input('contactNumber', sql.BigInt, contactNumber)
      .input('avatar', sql.NVarChar, avatar)
      .input('designation', sql.NVarChar, designation)
      .input('email', sql.NVarChar, email)
      .query(query);

    res.status(200).json({ message: "Faculty updated successfully" });
  } catch (error) {
    console.log("Error in updateFaculty:", error);
    res.status(500).json({ backendError: 'Internal server error' });
  }
};
export const createTest = async (req, res) => {
  const { subjectCode, department, year, section, date, test, totalMarks } = req.body;
  const errors = { testError: '' };

  try {
    const pool =   await sql.connect(sqlConfig);

    const existingTest = await pool.request()
      .input('subjectCode', sql.NVarChar, subjectCode)
      .input('department', sql.NVarChar, department)
      .input('year', sql.NVarChar, year)
      .input('section', sql.NVarChar, section)
      .input('test', sql.NVarChar, test)
      .query('SELECT * FROM Test WHERE subjectCode = @subjectCode AND department = @department AND year = @year AND section = @section AND test = @test');

    if (existingTest.recordset.length > 0) {
      errors.testError = "Given Test is already created";
      return res.status(400).json(errors);
    }

    await pool.request()
      .input('subjectCode', sql.NVarChar, subjectCode)
      .input('department', sql.NVarChar, department)
      .input('year', sql.NVarChar, year)
      .input('section', sql.NVarChar, section)
      .input('date', sql.NVarChar, date)
      .input('test', sql.NVarChar, test)
      .input('totalMarks', sql.Int, totalMarks)
      .query('INSERT INTO Test (subjectCode, department, year, section, date, test, totalMarks) VALUES (@subjectCode, @department, @year, @section, @date, @test, @totalMarks)');

    res.status(200).json({ success: true, message: "Test added successfully" });
  } catch (error) {
    console.log("Error in createTest:", error);
    res.status(500).json({ backendError: 'Internal server error' });
  }
};
export const getTest = async (req, res) => {
  const { department, year, section } = req.body;

  try {
    const pool =   await sql.connect(sqlConfig);

    const tests = await pool.request()
      .input('department', sql.NVarChar, department)
      .input('year', sql.NVarChar, year)
      .input('section', sql.NVarChar, section)
      .query('SELECT * FROM Test WHERE department = @department AND year = @year AND section = @section');

    res.status(200).json({ result: tests.recordset });
  } catch (error) {
    console.log("Error in getTest:", error);
    res.status(500).json({ backendError: 'Internal server error' });
  }
};
export const getStudent = async (req, res) => {
  const { department, year, section } = req.body;
  const errors = { noStudentError: '' };

  try {
    const pool =   await sql.connect(sqlConfig);

    const students = await pool.request()
      .input('department', sql.NVarChar, department)
      .input('year', sql.NVarChar, year)
      .input('section', sql.NVarChar, section)
      .query('SELECT * FROM Student WHERE department = @department AND year = @year AND section = @section');

    if (students.recordset.length === 0) {
      errors.noStudentError = "No Student Found";
      return res.status(404).json(errors);
    }

    res.status(200).json({ result: students.recordset });
  } catch (error) {
    console.log("Error in getStudent:", error);
    res.status(500).json({ backendError: 'Internal server error' });
  }
};
export const uploadMarks = async (req, res) => {
  const { department, year, section, test, marks } = req.body;
  const errors = { examError: '' };

  try {
    const pool =  await sql.connect(sqlConfig);

    const existingTest = await pool.request()
      .input('department', sql.NVarChar, department)
      .input('year', sql.NVarChar, year)
      .input('section', sql.NVarChar, section)
      .input('test', sql.NVarChar, test)
      .query('SELECT * FROM Test WHERE department = @department AND year = @year AND section = @section AND test = @test');

    if (existingTest.recordset.length === 0) {
      errors.examError = "Test does not exist";
      return res.status(400).json(errors);
    }

    const testId = existingTest.recordset[0].id; // Adjust based on your schema

    const existingMarks = await pool.request()
      .input('testId', sql.Int, testId)
      .query('SELECT * FROM Marks WHERE exam = @testId');

    if (existingMarks.recordset.length !== 0) {
      errors.examError = "You have already uploaded marks for the given exam";
      return res.status(400).json(errors);
    }

    for (const mark of marks) {
      await pool.request()
        .input('student', sql.NVarChar, mark._id)
        .input('exam', sql.Int, testId)
        .input('marks', sql.Int, mark.value)
        .query('INSERT INTO Marks (student, exam, marks) VALUES (@student, @exam, @marks)');
    }

    res.status(200).json({ message: "Marks uploaded successfully" });
  } catch (error) {
    console.log("Error in uploadMarks:", error);
    res.status(500).json({ backendError: 'Internal server error' });
  }
};
export const markAttendance = async (req, res) => {
  const { selectedStudents, subjectName, department, year, section } = req.body;

  try {
    const pool =  await sql.connect(sqlConfig);

    const sub = await pool.request()
      .input('subjectName', sql.NVarChar, subjectName)
      .query('SELECT * FROM Subject WHERE subjectName = @subjectName');

    if (sub.recordset.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const subjectId = sub.recordset[0].id; // Adjust based on your schema

    const allStudents = await pool.request()
      .input('department', sql.NVarChar, department)
      .input('year', sql.NVarChar, year)
      .input('section', sql.NVarChar, section)
      .query('SELECT * FROM Student WHERE department = @department AND year = @year AND section = @section');

    for (const student of allStudents.recordset) {
      const attendance = await pool.request()
        .input('studentId', sql.NVarChar, student.id)
        .input('subjectId', sql.Int, subjectId)
        .query('SELECT * FROM Attendence WHERE student = @studentId AND subject = @subjectId');

      if (attendance.recordset.length === 0) {
        await pool.request()
          .input('studentId', sql.NVarChar, student.id)
          .input('subjectId', sql.Int, subjectId)
          .input('totalLecturesByFaculty', sql.Int, 1)
          .query('INSERT INTO Attendence (student, subject, totalLecturesByFaculty) VALUES (@studentId, @subjectId, @totalLecturesByFaculty)');
      } else {
        await pool.request()
          .input('studentId', sql.NVarChar, student.id)
          .input('subjectId', sql.Int, subjectId)
          .query('UPDATE Attendence SET totalLecturesByFaculty = totalLecturesByFaculty + 1 WHERE student = @studentId AND subject = @subjectId');
      }
    }

    for (const studentId of selectedStudents) {
      const attendance = await pool.request()
        .input('studentId', sql.NVarChar, studentId)
        .input('subjectId', sql.Int, subjectId)
        .query('SELECT * FROM Attendence WHERE student = @studentId AND subject = @subjectId');

      if (attendance.recordset.length === 0) {
        await pool.request()
          .input('studentId', sql.NVarChar, studentId)
          .input('subjectId', sql.Int, subjectId)
          .input('lectureAttended', sql.Int, 1)
          .query('INSERT INTO Attendence (student, subject, lectureAttended) VALUES (@studentId, @subjectId, @lectureAttended)');
      } else {
        await pool.request()
          .input('studentId', sql.NVarChar, studentId)
          .input('subjectId', sql.Int, subjectId)
          .query('UPDATE Attendence SET lectureAttended = lectureAttended + 1 WHERE student = @studentId AND subject = @subjectId');
      }
    }

    res.status(200).json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.log("Error in markAttendance:", error);
    res.status(500).json({ backendError: 'Internal server error' });
  }
};
