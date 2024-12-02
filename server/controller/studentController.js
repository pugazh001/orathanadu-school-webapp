// import student from "../models/student.js";
// import Test from "../models/test.js";
// import Student from "../models/student.js";
// import Subject from "../models/subject.js";
// import Marks from "../models/marks.js";
// import Attendence from "../models/attendance.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sql from 'mssql';
import { sqlConfig } from "../index.js";
// export const studentLogin = async (req, res) => {
//   const { username, password } = req.body;
//   const errors = { usernameError: String, passwordError: String };
//   try {
//     const existingStudent = await Student.findOne({ username });
//     if (!existingStudent) {
//       errors.usernameError = "Student doesn't exist.";
//       return res.status(404).json(errors);
//     }
//     const isPasswordCorrect = await bcrypt.compare(
//       password,
//       existingStudent.password
//     );
//     if (!isPasswordCorrect) {
//       errors.passwordError = "Invalid Credentials";
//       return res.status(404).json(errors);
//     }

//     const token = jwt.sign(
//       {
//         email: existingStudent.email,
//         id: existingStudent._id,
//       },
//       "sEcReT",
//       { expiresIn: "1h" }
//     );

//     res.status(200).json({ result: existingStudent, token: token });
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const updatedPassword = async (req, res) => {
//   try {
//     const { newPassword, confirmPassword, email } = req.body;
//     const errors = { mismatchError: String };
//     if (newPassword !== confirmPassword) {
//       errors.mismatchError =
//         "Your password and confirmation password do not match";
//       return res.status(400).json(errors);
//     }

//     const student = await Student.findOne({ email });
//     let hashedPassword;
//     hashedPassword = await bcrypt.hash(newPassword, 10);
//     student.password = hashedPassword;
//     await student.save();
//     if (student.passwordUpdated === false) {
//       student.passwordUpdated = true;
//       await student.save();
//     }

//     res.status(200).json({
//       success: true,
//       message: "Password updated successfully",
//       response: student,
//     });
//   } catch (error) {
//     res.status(500).json(error);
//   }
// };

// export const updateStudent = async (req, res) => {
//   try {
//     const {
//       name,
//       dob,
//       department,
//       contactNumber,
//       avatar,
//       email,
//       batch,
//       section,
//       year,
//       fatherName,
//       motherName,
//       fatherContactNumber,
//     } = req.body;
//     const updatedStudent = await Student.findOne({ email });
//     if (name) {
//       updatedStudent.name = name;
//       await updatedStudent.save();
//     }
//     if (dob) {
//       updatedStudent.dob = dob;
//       await updatedStudent.save();
//     }
//     if (department) {
//       updatedStudent.department = department;
//       await updatedStudent.save();
//     }
//     if (contactNumber) {
//       updatedStudent.contactNumber = contactNumber;
//       await updatedStudent.save();
//     }
//     if (batch) {
//       updatedStudent.batch = batch;
//       await updatedStudent.save();
//     }
//     if (section) {
//       updatedStudent.section = section;
//       await updatedStudent.save();
//     }
//     if (year) {
//       updatedStudent.year = year;
//       await updatedStudent.save();
//     }
//     if (motherName) {
//       updatedStudent.motherName = motherName;
//       await updatedStudent.save();
//     }
//     if (fatherName) {
//       updatedStudent.fatherName = fatherName;
//       await updatedStudent.save();
//     }
//     if (fatherContactNumber) {
//       updatedStudent.fatherContactNumber = fatherContactNumber;
//       await updatedStudent.save();
//     }
//     if (avatar) {
//       updatedStudent.avatar = avatar;
//       await updatedStudent.save();
//     }
//     res.status(200).json(updatedStudent);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// };

// export const testResult = async (req, res) => {
//   try {
//     const { department, year, section } = req.body;
//     const errors = { notestError: String };
//     const student = await Student.findOne({ department, year, section });
//     const test = await Test.find({ department, year, section });
//     if (test.length === 0) {
//       errors.notestError = "No Test Found";
//       return res.status(404).json(errors);
//     }
//     var result = [];
//     for (var i = 0; i < test.length; i++) {
//       var subjectCode = test[i].subjectCode;
//       var subject = await Subject.findOne({ subjectCode });
//       var marks = await Marks.findOne({
//         student: student._id,
//         exam: test[i]._id,
//       });
//       if (marks) {
//         var temp = {
//           marks: marks.marks,
//           totalMarks: test[i].totalMarks,
//           subjectName: subject.subjectName,
//           subjectCode,
//           test: test[i].test,
//         };

//         result.push(temp);
//       }
//     }

//     res.status(200).json({ result });
//   } catch (error) {
//     res.status(500).json(error);
//   }
// };

// export const attendance = async (req, res) => {
//   try {
//     const { department, year, section } = req.body;
//     const errors = { notestError: String };
//     const student = await Student.findOne({ department, year, section });

//     const attendence = await Attendence.find({
//       student: student._id,
//     }).populate("subject");
//     if (!attendence) {
//       res.status(400).json({ message: "Attendence not found" });
//     }

//     res.status(200).json({
//       result: attendence.map((att) => {
//         let res = {};
//         res.percentage = (
//           (att.lectureAttended / att.totalLecturesByFaculty) *
//           100
//         ).toFixed(2);
//         res.subjectCode = att.subject.subjectCode;
//         res.subjectName = att.subject.subjectName;
//         res.attended = att.lectureAttended;
//         res.total = att.totalLecturesByFaculty;
//         return res;
//       }),
//     });
//   } catch (error) {
//     res.status(500).json(error);
//   }
// };
export const studentLogin = async (req, res) => {
  const { username, password } = req.body;
  const errors = { usernameError: '', passwordError: '' };

  try {
   // const pool = await poolPromise;
   const pool =  await sql.connect(sqlConfig);

    const student = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM Student WHERE username = @username');

    if (student.recordset.length === 0) {
      errors.usernameError = "Student doesn't exist.";
      return res.status(404).json(errors);
    }

    const existingStudent = student.recordset[0];
    const isPasswordCorrect = await bcrypt.compare(password, existingStudent.password);
    if (!isPasswordCorrect) {
      errors.passwordError = "Invalid Credentials";
      return res.status(404).json(errors);
    }

    const token = jwt.sign(
      { email: existingStudent.email, id: existingStudent.id },
      "sEcReT",
      { expiresIn: "1h" }
    );

    res.status(200).json({ result: existingStudent, token: token });
  } catch (error) {
    console.log("Error in studentLogin:", error);
    res.status(500).json({ backendError: 'Internal server error' });
  }
};
export const updatedPassword = async (req, res) => {
  const { newPassword, confirmPassword, email } = req.body;
  const errors = { mismatchError: '' };

  if (newPassword !== confirmPassword) {
    errors.mismatchError = "Your password and confirmation password do not match";
    return res.status(400).json(errors);
  }

  try {
    //const pool = await poolPromise;
    const pool =  await sql.connect(sqlConfig);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .query('UPDATE Student SET password = @password, passwordUpdated = 1 WHERE email = @email');

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log("Error in updatedPassword:", error);
    res.status(500).json({ backendError: 'Internal server error' });
  }
};
export const updateStudent = async (req, res) => {
  const {
    name,
    dob,
    department,
    contactNumber,
    avatar,
    email,
    batch,
    section,
    year,
    fatherName,
    motherName,
    fatherContactNumber,
    motherContactNumber,
  } = req.body;

  try {
    //const pool = await poolPromise;
    const pool =  await sql.connect(sqlConfig);

    const query = `
      UPDATE Student SET 
        name = ISNULL(@name, name),
        dob = ISNULL(@dob, dob),
        department = ISNULL(@department, department),
        contactNumber = ISNULL(@contactNumber, contactNumber),
        batch = ISNULL(@batch, batch),
        section = ISNULL(@section, section),
        year = ISNULL(@year, year),
        motherName = ISNULL(@motherName, motherName),
        fatherName = ISNULL(@fatherName, fatherName),
        fatherContactNumber = ISNULL(@fatherContactNumber, fatherContactNumber),
        motherContactNumber = ISNULL(@fatherContactNumber, fatherContactNumber),
        avatar = ISNULL(@avatar, avatar)
      WHERE email = @email
    `;

    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('dob', sql.Date, dob)
      .input('department', sql.NVarChar, department)
      .input('contactNumber', sql.BigInt, contactNumber)
      .input('avatar', sql.NVarChar, avatar)
      .input('batch', sql.NVarChar, batch)
      .input('section', sql.NVarChar, section)
      .input('year', sql.NVarChar, year)
      .input('motherName', sql.NVarChar, motherName)
      .input('fatherName', sql.NVarChar, fatherName)
      .input('fatherContactNumber', sql.BigInt, fatherContactNumber)
      .input('fatherContactNumber', sql.BigInt, motherContactNumber)
      .input('email', sql.NVarChar, email)
      .query(query);

    res.status(200).json({ message: "Student updated successfully" });
  } catch (error) {
    console.log("Error in updateStudent:", error);
    res.status(500).json({ backendError: 'Internal server error' });
  }
};
export const testResult = async (req, res) => {
  const { department, year, section } = req.body;
  const errors = { notestError: '' };

  try {
   // const pool = await poolPromise;
   const pool =  await sql.connect(sqlConfig);

    const student = await pool.request()
      .input('department', sql.NVarChar, department)
      .input('year', sql.NVarChar, year)
      .input('section', sql.NVarChar, section)
      .query('SELECT * FROM Student WHERE department = @department AND year = @year AND section = @section');

    if (student.recordset.length === 0) {
      errors.notestError = "No Student Found";
      return res.status(404).json(errors);
    }

    const studentId = student.recordset[0].id; // Adjust based on your schema
    const tests = await pool.request()
      .input('department', sql.NVarChar, department)
      .input('year', sql.NVarChar, year)
      .input('section', sql.NVarChar, section)
      .query('SELECT * FROM Test WHERE department = @department AND year = @year AND section = @section');

    if (tests.recordset.length === 0) {
      errors.notestError = "No Test Found";
      return res.status(404).json(errors);
    }

    const results = [];
    for (const test of tests.recordset) {
      const marks = await pool.request()
        .input('studentId', sql.Int, studentId)
        .input('testId', sql.Int, test.id)
        .query('SELECT * FROM Marks WHERE student = @studentId AND exam = @testId');

      if (marks.recordset.length > 0) {
        const mark = marks.recordset[0];
        results.push({
          marks: mark.marks,
          totalMarks: test.totalMarks,
          subjectName: test.subjectName, // You might need to join with Subject table to get subjectName
          subjectCode: test.subjectCode,
          test: test.test,
        });
      }
    }

    res.status(200).json({ result: results });
  } catch (error) {
    console.log("Error in testResult:", error);
    res.status(500).json({ backendError: 'Internal server error' });
  }
};
export const attendance = async (req, res) => {
  const { department, year, section } = req.body;

  try {
    const pool =  await sql.connect(sqlConfig);

   // const pool = await poolPromise;
    const student = await pool.request()
      .input('department', sql.NVarChar, department)
      .input('year', sql.NVarChar, year)
      .input('section', sql.NVarChar, section)
      .query('SELECT * FROM Student WHERE department = @department AND year = @year AND section = @section');

    if (student.recordset.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentId = student.recordset[0].id; // Adjust based on your schema
    const attendanceRecords = await pool.request()
      .input('studentId', sql.Int, studentId)
      .query('SELECT * FROM Attendence WHERE student = @studentId');

    if (attendanceRecords.recordset.length === 0) {
      return res.status(400).json({ message: "Attendance not found" });
    }

    const results = attendanceRecords.recordset.map(att => {
      return {
        percentage: (
          (att.lectureAttended / att.totalLecturesByFaculty) * 100
        ).toFixed(2),
        subjectCode: att.subjectCode, // You might need to join with Subject table to get subjectCode
        subjectName: att.subjectName, // You might need to join with Subject table to get subjectName
        attended: att.lectureAttended,
        total: att.totalLecturesByFaculty,
      };
    });

    res.status(200).json({ result: results });
  } catch (error) {
    console.log("Error in attendance:", error);
    res.status(500).json({ backendError: 'Internal server error' });
  }
};
