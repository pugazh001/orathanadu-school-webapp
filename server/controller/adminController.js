//import Admin from "../models/admin.js";
// import Department from "../models/department.js";
// import Faculty from "../models/faculty.js";
// import Student from "../models/student.js";
// import Subject from "../models/subject.js";
// import Notice from "../models/notice.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sql from 'mssql';

import { sqlConfig } from "../index.js";
// export const adminLogin = async (req, res) => {
//   const { username, password } = req.body;
//   const errors = { usernameError: String, passwordError: String };
//   try {
//     const existingAdmin = await Admin.findOne({ username });
//     if (!existingAdmin) {
//       errors.usernameError = "Admin doesn't exist.";
//       return res.status(404).json(errors);
//     }
//     const isPasswordCorrect = await bcrypt.compare(
//       password,
//       existingAdmin.password
//     );
//     if (!isPasswordCorrect) {
//       errors.passwordError = "Invalid Credentials";
//       return res.status(404).json(errors);
//     }

//     const token = jwt.sign(
//       {
//         email: existingAdmin.email,
//         id: existingAdmin._id,
//       },
//       "sEcReT",
//       { expiresIn: "1h" }
//     );

//     res.status(200).json({ result: existingAdmin, token: token });
//   } catch (error) {
//     console.log(error);
//   }
// };
export const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  const errors = { usernameError: '', passwordError: '' };

  try {
    // Connect to MS SQL
    await sql.connect(sqlConfig);

    // Query to find the admin by username
    const result = await sql.query`SELECT * FROM Admins WHERE username = ${username}`;
    const existingAdmin = result.recordset[0];

    if (!existingAdmin) {
      errors.usernameError = "Admin doesn't exist.";
      return res.status(404).json(errors);
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingAdmin.password);
    if (!isPasswordCorrect) {
      errors.passwordError = "Invalid Credentials";
      return res.status(404).json(errors);
    }

    const token = jwt.sign(
      {
        email: existingAdmin.email,
        id: existingAdmin.id,
      },
      "sEcReT",
      { expiresIn: "1h" }
    );

    res.status(200).json({ result: existingAdmin, token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    sql.close();
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

//     const admin = await Admin.findOne({ email });
//     let hashedPassword;
//     hashedPassword = await bcrypt.hash(newPassword, 10);
//     admin.password = hashedPassword;
//     await admin.save();
//     if (admin.passwordUpdated === false) {
//       admin.passwordUpdated = true;
//       await admin.save();
//     }

//     res.status(200).json({
//       success: true,
//       message: "Password updated successfully",
//       response: admin,
//     });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };
export const updatedPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword, email } = req.body;
    const errors = { mismatchError: '' };

    if (newPassword !== confirmPassword) {
      errors.mismatchError = "Your password and confirmation password do not match";
      return res.status(400).json(errors);
    }

    await sql.connect(sqlConfig);

    // Find the admin by email
    const result = await sql.query`SELECT * FROM Admins WHERE email = ${email}`;
    const admin = result.recordset[0];

    if (!admin) {
      errors.mismatchError = "Admin not found";
      return res.status(404).json(errors);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password and passwordUpdated fields
    await sql.query`
      UPDATE Admins
      SET password = ${hashedPassword}, passwordUpdated = 1
      WHERE email = ${email}
    `;

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      response: { ...admin, password: hashedPassword, passwordUpdated: 1 },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ backendError: error.message });
  } finally {
    sql.close();
  }
};
// export const updateAdmin = async (req, res) => {
//   try {
//     const { name, dob, department, contactNumber, avatar, email } = req.body;
//     const updatedAdmin = await Admin.findOne({ email });
//     if (name) {
//       updatedAdmin.name = name;
//       await updatedAdmin.save();
//     }
//     if (dob) {
//       updatedAdmin.dob = dob;
//       await updatedAdmin.save();
//     }
//     if (department) {
//       updatedAdmin.department = department;
//       await updatedAdmin.save();
//     }
//     if (contactNumber) {
//       updatedAdmin.contactNumber = contactNumber;
//       await updatedAdmin.save();
//     }
//     if (avatar) {
//       updatedAdmin.avatar = avatar;
//       await updatedAdmin.save();
//     }
//     res.status(200).json(updatedAdmin);
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };
export const updateAdmin = async (req, res) => {
  try {
    const { name, dob, department, contactNumber, avatar, email } = req.body;

    await sql.connect(sqlConfig);

    // Find the admin by email
    const result = await sql.query`SELECT * FROM Admins WHERE email = ${email}`;
    const admin = result.recordset[0];

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Update the admin fields if provided
    if (name) {
      await sql.query`UPDATE Admins SET name = ${name} WHERE email = ${email}`;
    }
    if (dob) {
      await sql.query`UPDATE Admins SET dob = ${dob} WHERE email = ${email}`;
    }
    if (department) {
      await sql.query`UPDATE Admins SET department = ${department} WHERE email = ${email}`;
    }
    if (contactNumber) {
      await sql.query`UPDATE Admins SET contactNumber = ${contactNumber} WHERE email = ${email}`;
    }
    if (avatar) {
      await sql.query`UPDATE Admins SET avatar = ${avatar} WHERE email = ${email}`;
    }

    // Retrieve the updated admin details
    const updatedResult = await sql.query`SELECT * FROM Admins WHERE email = ${email}`;
    const updatedAdmin = updatedResult.recordset[0];

    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ backendError: error.message });
  } finally {
    sql.close();
  }
};
// export const addAdmin = async (req, res) => {
//   try {
//     const { name, dob, department, contactNumber, avatar, email, joiningYear } =
//       req.body;
//     const errors = { emailError: String };
//     const existingAdmin = await Admin.findOne({ email });
//     if (existingAdmin) {
//       errors.emailError = "Email already exists";
//       return res.status(400).json(errors);
//     }
//     const existingDepartment = await Department.findOne({ department });
//     let departmentHelper = existingDepartment.departmentCode;
//     const admins = await Admin.find({ department });

//     let helper;
//     if (admins.length < 10) {
//       helper = "00" + admins.length.toString();
//     } else if (admins.length < 100 && admins.length > 9) {
//       helper = "0" + admins.length.toString();
//     } else {
//       helper = admins.length.toString();
//     }
//     var date = new Date();
//     var components = ["ADM", date.getFullYear(), departmentHelper, helper];

//     var username = components.join("");
//     let hashedPassword;
//     const newDob = dob.split("-").reverse().join("-");
//   console.log(newDob);
//     hashedPassword = await bcrypt.hash(newDob, 10);
//     var passwordUpdated = false;
//     const newAdmin = await new Admin({
//       name,
//       email,
//       password: hashedPassword,
//       joiningYear,
//       username,
//       department,
//       avatar,
//       contactNumber,
//       dob,
//       passwordUpdated,
//     });
//     await newAdmin.save();
//     return res.status(200).json({
//       success: true,
//       message: "Admin registerd successfully",
//       response: newAdmin,
//     });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };
export const addAdmin = async (req, res) => {
  try {
    const { name, dob, department, contactNumber, avatar, email, joiningYear } = req.body;
     console.log(avatar);
    // Validate required fields
    if (!name || !dob || !department || !contactNumber || !email || !joiningYear) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Connect to the database
    await sql.connect(sqlConfig);

    // Check for existing admin
    const checkAdminResult = await sql.query`SELECT * FROM Admins WHERE email = ${email}`;
    if (checkAdminResult.recordset.length > 0) {
      return res.status(400).json({ emailError: "Email already exists" });
    }

    // Check for existing department
    const checkDepartmentResult = await sql.query`SELECT * FROM Departments WHERE department = ${department}`;
    if (checkDepartmentResult.recordset.length === 0) {
      return res.status(400).json({ departmentError: "Department not found" });
    }

    const departmentHelper = checkDepartmentResult.recordset[0].departmentCode;
    const adminsInDepartment = await sql.query`SELECT * FROM Admins WHERE department = ${department}`;
    const adminCount = adminsInDepartment.recordset.length;

    // Generate username
    const helper = (adminCount < 10) ? `00${adminCount}` :
                   (adminCount < 100) ? `0${adminCount}` : `${adminCount}`;
    const date = new Date();
    const username = `ADM${date.getFullYear()}${departmentHelper}${helper}`;

    // Hash the password
    const newDob = dob.split("-").reverse().join("-");
    const hashedPassword = await bcrypt.hash(newDob, 10);

    // Insert new admin
    const result = await sql.query`INSERT INTO Admins (name, email, password, username, department, dob, joiningYear, avatar, contactNumber, passwordUpdated)
                                   VALUES (${name}, ${email}, ${hashedPassword}, ${username}, ${department}, ${dob}, ${joiningYear}, ${avatar}, ${contactNumber}, 0)`;

    // Retrieve the newly added admin
    const newAdminResult = await sql.query`SELECT * FROM Admins WHERE email = ${email}`;
    const newAdmin = newAdminResult.recordset[0];

    return res.status(200).json({
      success: true,
      message: "Admin registered successfully",
      response: newAdmin
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};
// export const addAdmin = async (req, res) => {
//   try {
//     const { name, dob, department, contactNumber, avatar, email, joiningYear } = req.body;

//     // Validate required fields
//     if (!name || !dob || !department || !contactNumber || !email || !joiningYear) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     // Connect to the database
//     await sql.connect(sqlConfig);

//     // Check for existing admin
//     const checkAdminResult = await sql.query`SELECT * FROM Admins WHERE email = ${email}`;
//     if (checkAdminResult.recordset.length > 0) {
//       return res.status(400).json({ emailError: "Email already exists" });
//     }

//     // Check for existing department
//     const checkDepartmentResult = await sql.query`SELECT * FROM Departments WHERE department = ${department}`;
//     if (checkDepartmentResult.recordset.length === 0) {
//       return res.status(400).json({ departmentError: "Department not found" });
//     }

//     const departmentHelper = checkDepartmentResult.recordset[0].departmentCode;
//     const adminsInDepartment = await sql.query`SELECT * FROM Admins WHERE department = ${department}`;
//     const adminCount = adminsInDepartment.recordset.length;

//     // Generate username
//     const helper = (adminCount < 10) ? `00${adminCount}` :
//                    (adminCount < 100) ? `0${adminCount}` : `${adminCount}`;
//     const date = new Date();
//     const username = `ADM${date.getFullYear()}${departmentHelper}${helper}`;

//     // Hash the password
//     const newDob = dob.split("-").reverse().join("-");
//     const hashedPassword = await bcrypt.hash(newDob, 10);

//     // Convert base64 avatar to binary
//     const avatarBuffer = avatar ? Buffer.from(avatar.split(",")[1], 'base64') : null;

//     // Insert new admin
//     const result = await sql.query`
//       INSERT INTO Admins (name, email, password, username, department, dob, joiningYear, avatar, contactNumber, passwordUpdated)
//       VALUES (${name}, ${email}, ${hashedPassword}, ${username}, ${department}, ${dob}, ${joiningYear}, 
//               ${avatarBuffer ? `CONVERT(VARBINARY(MAX), 0x${avatarBuffer.toString('hex')}, 1)` : null}, 
//               ${contactNumber}, 0)`;

//     // Retrieve the newly added admin
//     const newAdminResult = await sql.query`SELECT * FROM Admins WHERE email = ${email}`;
//     const newAdmin = newAdminResult.recordset[0];

//     return res.status(200).json({
//       success: true,
//       message: "Admin registered successfully",
//       response: newAdmin
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ backendError: error.message });
//   } finally {
//     // Close the connection
//     sql.close();
//   }
// };

// export const addDummyAdmin = async () => {
//   const email = "dummy@gmail.com";
//   const password = "123";
//   const name = "dummy";
//   const username = "ADMDUMMY";
//   let hashedPassword;
//   hashedPassword = await bcrypt.hash(password, 10);
//   var passwordUpdated = true;

//   const dummyAdmin = await Admin.findOne({ email });

//   if (!dummyAdmin) {
//     await Admin.create({
//       name,
//       email,
//       password: hashedPassword,
//       username,
//       passwordUpdated,
//     });
//     console.log("Dummy user added.");
//   } else {
//     console.log("Dummy user already exists.");
//   }
// };
export const addDummyAdmin = async () => {
  try {
    const email = "dummy@gmail.com";
    const password = "123";
    const name = "dummy";
    const username = "ADMDUMMY";
    const hashedPassword = await bcrypt.hash(password, 10);
    const passwordUpdated = true;

    // Connect to the database
    await sql.connect(sqlConfig);

    // Check if the dummy admin already exists
    const checkAdminResult = await sql.query`SELECT * FROM Admins WHERE email = ${email}`;
    if (checkAdminResult.recordset.length === 0) {
      // Insert the dummy admin
      await sql.query`INSERT INTO Admins (name, email, password, username, passwordUpdated)
                      VALUES (${name}, ${email}, ${hashedPassword}, ${username}, ${passwordUpdated})`;
      console.log("Dummy user added.");
    } else {
      console.log("Dummy user already exists.");
    }
  } catch (error) {
    console.error("Error adding dummy admin:", error.message);
  } finally {
    // Close the connection
    sql.close();
  }
};
// export const addDummyAdmin = async () => {
//   try {
//     const email = "dummy@gmail.com";
//     const password = "123";
//     const name = "dummy";
//     const username = "ADMDUMMY";
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const passwordUpdated = true;

//     // Connect to the database
//     const pool =  await sql.connect(sqlConfig);

//     // Check if the dummy admin already exists
//     const checkAdminResult = await pool.request()
//       .input('email', sql.NVarChar, email)
//       .query('SELECT * FROM dbo.Admins WHERE email = @email'); // Adjust schema if needed

//     if (checkAdminResult.recordset.length === 0) {
//       // Insert the dummy admin
//       await pool.request()
//         .input('name', sql.NVarChar, name)
//         .input('email', sql.NVarChar, email)
//         .input('password', sql.NVarChar, hashedPassword)
//         .input('username', sql.NVarChar, username)
//         .input('passwordUpdated', sql.Bit, passwordUpdated)
//         .query('INSERT INTO dbo.Admins (name, email, password, username, passwordUpdated) VALUES (@name, @email, @password, @username, @passwordUpdated)');
//       console.log("Dummy user added.");
//     } else {
//       console.log("Dummy user already exists.");
//     }
//   } catch (error) {
//     console.error("Error adding dummy admin:", error.message);
//   } finally {
//     // Close the connection
//     await sql.close();
//   }
// };

// export const createNotice = async (req, res) => {
//   try {
//     const { from, content, topic, date, noticeFor } = req.body;

//     const errors = { noticeError: String };
//     const exisitingNotice = await Notice.findOne({ topic, content, date });
//     if (exisitingNotice) {
//       errors.noticeError = "Notice already created";
//       return res.status(400).json(errors);
//     }
//     const newNotice = await new Notice({
//       from,
//       content,
//       topic,
//       noticeFor,
//       date,
//     });
//     await newNotice.save();
//     return res.status(200).json({
//       success: true,
//       message: "Notice created successfully",
//       response: newNotice,
//     });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };
export const createNotice = async (req, res) => {
  try {
    const { from, content, topic, date, noticeFor } = req.body;

    // Validate required fields
    if (!from || !content || !topic || !date || !noticeFor) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Connect to the database
    await sql.connect(sqlConfig);

    // Check for existing notice
    const checkNoticeResult = await sql.query`SELECT * FROM Notices WHERE topic = ${topic} AND content = ${content} AND date = ${date}`;
    if (checkNoticeResult.recordset.length > 0) {
      return res.status(400).json({ noticeError: "Notice already created" });
    }

    // Insert new notice
    const result = await sql.query`INSERT INTO Notices (froms, content, topic, noticeFor, date)
                                   VALUES (${from}, ${content}, ${topic}, ${noticeFor}, ${date})`;

    // Retrieve the newly created notice
    const newNoticeResult = await sql.query`SELECT * FROM Notices WHERE topic = ${topic} AND content = ${content} AND date = ${date}`;
    const newNotice = newNoticeResult.recordset[0];

    return res.status(200).json({
      success: true,
      message: "Notice created successfully",
      response: newNotice
    });
  } catch (error) {
    console.error("Error creating notice:", error.message);
    return res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};
// export const addDepartment = async (req, res) => {
//   try {
//     const errors = { departmentError: String };
//     const { department } = req.body;
//     const existingDepartment = await Department.findOne({ department });
//     if (existingDepartment) {
//       errors.departmentError = "Department already added";
//       return res.status(400).json(errors);
//     }
//     const departments = await Department.find({});
//     let add = departments.length + 1;
//     let departmentCode;
//     if (add < 9) {
//       departmentCode = "0" + add.toString();
//     } else {
//       departmentCode = add.toString();
//     }

//     const newDepartment = await new Department({
//       department,
//       departmentCode,
//     });

//     await newDepartment.save();
//     return res.status(200).json({
//       success: true,
//       message: "Department added successfully",
//       response: newDepartment,
//     });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };
export const addDepartment = async (req, res) => {
  try {
    const { department } = req.body;
     //console.log(department);
    // Validate required fields
    if (!department) {
      return res.status(400).json({ error: "Department field is required" });
    }

    // Connect to the database
    await sql.connect(sqlConfig);

    // Check if department already exists
    const checkDepartmentResult = await sql.query`SELECT * FROM Departments WHERE department = ${department}`;
    if (checkDepartmentResult.recordset.length > 0) {
      return res.status(400).json({ departmentError: "Department already added" });
    }

    // Get the count of existing departments
    const departmentsCountResult = await sql.query`SELECT COUNT(*) AS count FROM Departments`;
    const departmentCount = departmentsCountResult.recordset[0].count;

    // Generate department code
    const add = departmentCount + 1;
    const departmentCode = add < 10 ? `0${add}` : `${add}`;

    // Insert new department
    await sql.query`INSERT INTO Departments (department, departmentCode)
                    VALUES (${department}, ${departmentCode})`;

    // Retrieve the newly added department
    const newDepartmentResult = await sql.query`SELECT * FROM Departments WHERE department = ${department}`;
    const newDepartment = newDepartmentResult.recordset[0];

    return res.status(200).json({
      success: true,
      message: "Department added successfully",
      response: newDepartment
    });
  } catch (error) {
    console.error("Error adding department:", error.message);
    return res.status(500).json({ backendError: error.message });
  }
  

};
// export const addFaculty = async (req, res) => {
//   try {
//     const {
//       name,
//       dob,
//       department,
//       contactNumber,
//       avatar,
//       email,
//       joiningYear,
//       gender,
//       designation,
//     } = req.body;
//     const errors = { emailError: String };
//     const existingFaculty = await Faculty.findOne({ email });
//     if (existingFaculty) {
//       errors.emailError = "Email already exists";
//       return res.status(400).json(errors);
//     }
//     const existingDepartment = await Department.findOne({ department });
//     let departmentHelper = existingDepartment.departmentCode;

//     const faculties = await Faculty.find({ department });
//     let helper;
//     if (faculties.length < 10) {
//       helper = "00" + faculties.length.toString();
//     } else if (faculties.length < 100 && faculties.length > 9) {
//       helper = "0" + faculties.length.toString();
//     } else {
//       helper = faculties.length.toString();
//     }
//     var date = new Date();
//     var components = ["FAC", date.getFullYear(), departmentHelper, helper];

//     var username = components.join("");
//     let hashedPassword;
//     const newDob = dob.split("-").reverse().join("-");

//     hashedPassword = await bcrypt.hash(newDob, 10);
//     var passwordUpdated = false;

//     const newFaculty = await new Faculty({
//       name,
//       email,
//       password: hashedPassword,
//       joiningYear,
//       username,
//       department,
//       avatar,
//       contactNumber,
//       dob,
//       gender,
//       designation,
//       passwordUpdated,
//     });
//     await newFaculty.save();
//     return res.status(200).json({
//       success: true,
//       message: "Faculty registerd successfully",
//       response: newFaculty,
//     });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };
export const addFaculty = async (req, res) => {
  try {
    const {
      name,
      dob,
      department,
      contactNumber,
      avatar,
      email,
      joiningYear,
      gender,
      designation,
    } = req.body;

    // Validate required fields
    if (!name || !dob || !department || !contactNumber || !email || !joiningYear || !gender || !designation) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Connect to the database
    await sql.connect(sqlConfig);

    // Check if the faculty email already exists
    const checkFacultyResult = await sql.query`SELECT * FROM Faculty WHERE email = ${email}`;
    if (checkFacultyResult.recordset.length > 0) {
      return res.status(400).json({ emailError: "Email already exists" });
    }

    // Check if the department exists and get the department code
    const checkDepartmentResult = await sql.query`SELECT departmentCode FROM Departments WHERE department = ${department}`;
    if (checkDepartmentResult.recordset.length === 0) {
      return res.status(400).json({ departmentError: "Department not found" });
    }
    const departmentHelper = checkDepartmentResult.recordset[0].departmentCode;

    // Get the count of faculties in the department
    const facultiesCountResult = await sql.query`SELECT COUNT(*) AS count FROM Faculty WHERE department = ${department}`;
    const facultyCount = facultiesCountResult.recordset[0].count;

    // Generate username
    const helper = facultyCount < 10 ? `00${facultyCount}` : facultyCount < 100 ? `0${facultyCount}` : `${facultyCount}`;
    const date = new Date();
    const username = `FAC${date.getFullYear()}${departmentHelper}${helper}`;

    // Hash the password
    const hashedPassword = await bcrypt.hash(dob.split("-").reverse().join("-"), 10);

    // Insert new faculty
    await sql.query`INSERT INTO Faculty (name, email, password, joiningYear, username, department, avatar, contactNumber, dob, gender, designation, passwordUpdated)
                    VALUES (${name}, ${email}, ${hashedPassword}, ${joiningYear}, ${username}, ${department}, ${avatar}, ${contactNumber}, ${dob}, ${gender}, ${designation}, 0)`;

    // Retrieve the newly added faculty
    const newFacultyResult = await sql.query`SELECT * FROM Faculty WHERE email = ${email}`;
    const newFaculty = newFacultyResult.recordset[0];

    return res.status(200).json({
      success: true,
      message: "Faculty registered successfully",
      response: newFaculty,
    });
  } catch (error) {
    console.error("Error adding faculty:", error.message);
    return res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};

// export const getFaculty = async (req, res) => {
//   try {
//     const { department } = req.body;
//     const errors = { noFacultyError: String };
//     const faculties = await Faculty.find({ department });
//     if (faculties.length === 0) {
//       errors.noFacultyError = "No Faculty Found";
//       return res.status(404).json(errors);
//     }
//     res.status(200).json({ result: faculties });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };
export const getFaculty = async (req, res) => {
  try {
    const { department } = req.body;

    // Validate required fields
    if (!department) {
      return res.status(400).json({ error: "Department is required" });
    }

    // Connect to the database
    await sql.connect(sqlConfig);

    // Query the database to find faculties in the specified department
    const result = await sql.query`SELECT * FROM Faculty WHERE department = ${department}`;
    const faculties = result.recordset;

    // Check if any faculties are found
    if (faculties.length === 0) {
      return res.status(404).json({ noFacultyError: "No Faculty Found" });
    }

    // Return the list of faculties
    return res.status(200).json({ result: faculties });
  } catch (error) {
    console.error("Error fetching faculty:", error.message);
    return res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};
// export const getNotice = async (req, res) => {
//   try {
//     const errors = { noNoticeError: String };
//     const notices = await Notice.find({});
//     if (notices.length === 0) {
//       errors.noNoticeError = "No Notice Found";
//       return res.status(404).json(errors);
//     }
//     res.status(200).json({ result: notices });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };
export const getNotice = async (req, res) => {
  try {
    // Connect to the database
    await sql.connect(sqlConfig);

    // Query the database to retrieve all notices
    const result = await sql.query`SELECT * FROM Notices`;
    const notices = result.recordset;

    // Check if any notices are found
    if (notices.length === 0) {
      return res.status(404).json({ noNoticeError: "No Notice Found" });
    }

    // Return the list of notices
    return res.status(200).json({ result: notices });
  } catch (error) {
    console.error("Error fetching notices:", error.message);
    return res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};

// export const addSubject = async (req, res) => {
//   try {
//     const { totalLectures, department, subjectCode, subjectName, year } =
//       req.body;
//     const errors = { subjectError: String };
//     const subject = await Subject.findOne({ subjectCode });
//     if (subject) {
//       errors.subjectError = "Given Subject is already added";
//       return res.status(400).json(errors);
//     }

//     const newSubject = await new Subject({
//       totalLectures,
//       department,
//       subjectCode,
//       subjectName,
//       year,
//     });

//     await newSubject.save();
//     const students = await Student.find({ department, year });
//     if (students.length !== 0) {
//       for (var i = 0; i < students.length; i++) {
//         students[i].subjects.push(newSubject._id);
//         await students[i].save();
//       }
//     }
//     return res.status(200).json({
//       success: true,
//       message: "Subject added successfully",
//       response: newSubject,
//     });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };
export const addSubject = async (req, res) => {
  try {
    const { totalLectures, department, subjectCode, subjectName, year } = req.body;

    // Validate required fields
    if (!totalLectures || !department || !subjectCode || !subjectName || !year) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Connect to the database
    await sql.connect(sqlConfig);

    // Check if the subject already exists
    const checkSubjectResult = await sql.query`SELECT * FROM Subject WHERE subjectCode = ${subjectCode}`;
    const existingSubject = checkSubjectResult.recordset[0];
    if (existingSubject) {
      return res.status(400).json({ subjectError: "Given Subject is already added" });
    }

    // Add the new subject
    await sql.query`
      INSERT INTO Subject (totalLectures, department, subjectCode, subjectName, year)
      VALUES (${totalLectures}, ${department}, ${subjectCode}, ${subjectName}, ${year})
    `;

    // Get the newly added subject ID
    const newSubjectResult = await sql.query`SELECT * FROM Subject WHERE subjectCode = ${subjectCode}`;
    const newSubject = newSubjectResult.recordset[0];

    // Find students and update their subjects
    const studentsResult = await sql.query`
      SELECT * FROM Student WHERE department = ${department} AND year = ${year}
    `;
    const students = studentsResult.recordset;

    if (students.length !== 0) {
      for (const student of students) {
        // Assuming students have a 'subjects' column of type JSON or a similar type to store array data
        const subjects = JSON.parse(student.subjects || '[]');
        subjects.push(newSubject.subjectID); // Assuming subjectID is the primary key column
        await sql.query`
          UPDATE Student
          SET subject = ${JSON.stringify(subjects)}
          WHERE studentID = ${student.studentID} // Assuming studentID is the primary key column
        `;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Subject added successfully",
      response: newSubject,
    });
  } catch (error) {
    console.error("Error adding subject:", error.message);
    return res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};

// export const getSubject = async (req, res) => {
//   try {
//     const { department, year } = req.body;

//     if (!req.userId) return res.json({ message: "Unauthenticated" });
//     const errors = { noSubjectError: String };

//     const subjects = await Subject.find({ department, year });
//     if (subjects.length === 0) {
//       errors.noSubjectError = "No Subject Found";
//       return res.status(404).json(errors);
//     }
//     res.status(200).json({ result: subjects });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };
export const getSubject = async (req, res) => {
  try {
    const { department, year } = req.body;

    // Check for user authentication
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    // Validate required fields
    if (!department || !year) {
      return res.status(400).json({ error: "Department and year are required" });
    }

    // Connect to the database
    await sql.connect(sqlConfig);

    // Query the database to retrieve subjects
    const result = await sql.query`
      SELECT * FROM Subject WHERE department = ${department} AND year = ${year}
    `;
    const subjects = result.recordset;

    // Check if any subjects are found
    if (subjects.length === 0) {
      return res.status(404).json({ noSubjectError: "No Subject Found" });
    }

    // Return the list of subjects
    return res.status(200).json({ result: subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error.message);
    return res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};

// export const getAdmin = async (req, res) => {
//   try {
//     const { department } = req.body;

//     const errors = { noAdminError: String };

//     const admins = await Admin.find({ department });
//     if (admins.length === 0) {
//       errors.noAdminError = "No Subject Found";
//       return res.status(404).json(errors);
//     }
//     res.status(200).json({ result: admins });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };
export const getAdmin = async (req, res) => {
  try {
    const { department } = req.body;

    // Validate required fields
    if (!department) {
      return res.status(400).json({ error: "Department is required" });
    }

    // Connect to the database
    await sql.connect(sqlConfig);

    // Query the database to retrieve admins
    const result = await sql.query`
      SELECT * FROM Admins WHERE department = ${department}
    `;
    const admins = result.recordset;

    // Check if any admins are found
    if (admins.length === 0) {
      return res.status(404).json({ noAdminError: "No Admin Found" });
    }

    // Return the list of admins
    return res.status(200).json({ result: admins });
  } catch (error) {
    console.error("Error fetching admins:", error.message);
    return res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};
// export const deleteAdmin = async (req, res) => {
//   try {
//     const admins = req.body;
//     const errors = { noAdminError: String };
//     for (var i = 0; i < admins.length; i++) {
//       var admin = admins[i];

//       await Admin.findOneAndDelete({ _id: admin });
//     }
//     res.status(200).json({ message: "Admin Deleted" });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };
export const deleteAdmin = async (req, res) => {
  try {
    const { adminIds } = req.body; // Expect an array of admin IDs to be deleted
     console.log(adminIds);
    if (!Array.isArray(adminIds) || adminIds.length === 0) {
      return res.status(400).json({ error: "No Admin IDs provided" });
    }

    // Connect to the database
    await sql.connect(sqlConfig);

    // Delete admins by their IDs
    for (const adminId of adminIds) {
      await sql.query`
        DELETE FROM Admins WHERE name = ${adminId}
      `;
    }

    res.status(200).json({ message: "Admins deleted successfully" });
  } catch (error) {
    console.error("Error deleting admins:", error.message);
    res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};
// export const deleteFaculty = async (req, res) => {
//   try {
//     const faculties = req.body;
//     const errors = { noFacultyError: String };
//     for (var i = 0; i < faculties.length; i++) {
//       var faculty = faculties[i];

//       await Faculty.findOneAndDelete({ _id: faculty });
//     }
//     res.status(200).json({ message: "Faculty Deleted" });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };
export const deleteFaculty = async (req, res) => {
  try {
    const { facultyIds } = req.body; // Expect an array of faculty IDs to be deleted

    if (!Array.isArray(facultyIds) || facultyIds.length === 0) {
      return res.status(400).json({ error: "No Faculty IDs provided" });
    }

    // Connect to the database
    await sql.connect(sqlConfig);

    // Delete faculties by their IDs
    for (const facultyId of facultyIds) {
      await sql.query`
        DELETE FROM Faculty WHERE id = ${facultyId}
      `;
    }

    res.status(200).json({ message: "Faculties deleted successfully" });
  } catch (error) {
    console.error("Error deleting faculties:", error.message);
    res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};
// export const deleteStudent = async (req, res) => {
//   try {
//     const students = req.body;
//     const errors = { noStudentError: String };
//     for (var i = 0; i < students.length; i++) {
//       var student = students[i];

//       await Student.findOneAndDelete({ _id: student });
//     }
//     res.status(200).json({ message: "Student Deleted" });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };
export const deleteStudent = async (req, res) => {
  try {
    const { studentIds } = req.body; // Expect an array of student IDs to be deleted
   // console.log(studentIds);
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: "No Student IDs provided" });
    }

    // Connect to the database
    await sql.connect(sqlConfig);

    // Delete students by their IDs
    for (const studentId of studentIds) {
      await sql.query`
        DELETE FROM Students WHERE id = ${studentId}
      `;
    }

    res.status(200).json({ message: "Students deleted successfully" });
  } catch (error) {
    console.error("Error deleting students:", error.message);
    res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};
// export const deleteSubject = async (req, res) => {
//   try {
//     const subjects = req.body;
//     const errors = { noSubjectError: String };
//     for (var i = 0; i < subjects.length; i++) {
//       var subject = subjects[i];

//       await Subject.findOneAndDelete({ _id: subject });
//     }
//     res.status(200).json({ message: "Subject Deleted" });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };
export const deleteSubject = async (req, res) => {
  try {
    const subjects  = req.body; // Expect an array of subject IDs to be deleted
    console.log(subjects);
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: "No Subject IDs provided" });
    }

    // Connect to the database
    await sql.connect(sqlConfig);

    // Delete subjects by their IDs
    for (const subjectId of subjects) {
      await sql.query`
        DELETE FROM Subject WHERE subjectCode = ${subjectId}
      `;
    }

    res.status(200).json({ message: "Subjects deleted successfully" });
  } catch (error) {
    console.error("Error deleting subjects here:", error.message);
    res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};
// export const deleteDepartment = async (req, res) => {
//   try {
//     const { department } = req.body;

//     await Department.findOneAndDelete({ department });

//     res.status(200).json({ message: "Department Deleted" });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };
export const deleteDepartment = async (req, res) => {
  try {
    const { department } = req.body;

    if (!department) {
      return res.status(400).json({ error: "Department name is required" });
    }

    // Connect to the database
    await sql.connect(sqlConfig);

    // Delete department by its name
    const result = await sql.query`
      DELETE FROM Departments WHERE department = ${department}
    `;

    // Check if any rows were affected
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error.message);
    res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};

// export const addStudent = async (req, res) => {
//   try {
//     const {
//       name,
//       dob,
//       department,
//       contactNumber,
//       avatar,
//       email,
//       section,
//       gender,
//       batch,
//       fatherName,
//       motherName,
//       fatherContactNumber,
//       motherContactNumber,
//       year,
//     } = req.body;
//     const errors = { emailError: String };
//     const existingStudent = await Student.findOne({ email });
//     if (existingStudent) {
//       errors.emailError = "Email already exists";
//       return res.status(400).json(errors);
//     }
//     const existingDepartment = await Department.findOne({ department });
//     let departmentHelper = existingDepartment.departmentCode;

//     const students = await Student.find({ department });
//     let helper;
//     if (students.length < 10) {
//       helper = "00" + students.length.toString();
//     } else if (students.length < 100 && students.length > 9) {
//       helper = "0" + students.length.toString();
//     } else {
//       helper = students.length.toString();
//     }
//     var date = new Date();
//     var components = ["STU", date.getFullYear(), departmentHelper, helper];

//     var username = components.join("");
//     let hashedPassword;
//     const newDob = dob.split("-").reverse().join("-");

//     hashedPassword = await bcrypt.hash(newDob, 10);
//     var passwordUpdated = false;

//     const newStudent = await new Student({
//       name,
//       dob,
//       password: hashedPassword,
//       username,
//       department,
//       contactNumber,
//       avatar,
//       email,
//       section,
//       gender,
//       batch,
//       fatherName,
//       motherName,
//       fatherContactNumber,
//       motherContactNumber,
//       year,
//       passwordUpdated,
//     });
//     await newStudent.save();
//     const subjects = await Subject.find({ department, year });
//     if (subjects.length !== 0) {
//       for (var i = 0; i < subjects.length; i++) {
//         newStudent.subjects.push(subjects[i]._id);
//       }
//     }
//     await newStudent.save();
//     return res.status(200).json({
//       success: true,
//       message: "Student registerd successfully",
//       response: newStudent,
//     });
//   } catch (error) {
//     const errors = { backendError: String };
//     errors.backendError = error;
//     res.status(500).json(errors);
//   }
// };
export const addStudent = async (req, res) => {
//   try {
//     const {
//       name,
//       dob,
//       department,
//       contactNumber,
//       avatar,
//       email,
//       section,
//       gender,
//       batch,
//       fatherName,
//       motherName,
//       fatherContactNumber,
//       motherContactNumber,
//       year,
//     } = req.body;

//     if (!name || !dob || !department || !contactNumber || !email || !section || !gender || !batch || !fatherName || !motherName || !fatherContactNumber || !motherContactNumber || !year) {
//       return res.status(400).json({ error: 'All fields are required' });
//     }

//     // Connect to the database
//     await sql.connect(sqlConfig);

//     // Check if student already exists
//     const result = await sql.query`
//       SELECT * FROM Student WHERE email = ${email}
//     `;
//     const existingStudent = result.recordset[0];
//     if (existingStudent) {
//       return res.status(400).json({ emailError: 'Email already exists' });
//     }

//     // Check if department exists
//     const departmentResult = await sql.query`
//       SELECT departmentCode FROM Departments WHERE department = ${department}
//     `;
//     const existingDepartment = departmentResult.recordset[0];
//     if (!existingDepartment) {
//       return res.status(400).json({ departmentError: 'Department does not exist' });
//     }
//     const departmentHelper = existingDepartment.departmentCode;

//     // Generate username
//     const studentsResult = await sql.query`
//       SELECT COUNT(*) AS count FROM Student WHERE department = ${department}
//     `;
//     const studentsCount = studentsResult.recordset[0].count;
//     let helper;
//     if (studentsCount < 10) {
//       helper = '00' + studentsCount.toString();
//     } else if (studentsCount < 100 && studentsCount > 9) {
//       helper = '0' + studentsCount.toString();
//     } else {
//       helper = studentsCount.toString();
//     }
//     const date = new Date();
//     const username = ['STU', date.getFullYear(), departmentHelper, helper].join('');

//     // Hash password
//     const newDob = dob.split('-').reverse().join('-');
//     const hashedPassword = await bcrypt.hash(newDob, 10);

//     // Insert new student
//     // await sql.query`
//     //   INSERT INTO Student (name, dob, password, username, department, contactNumber, avatar, email, section, gender, batch, fatherName, motherName, fatherContactNumber, motherContactNumber, year, passwordUpdated)
//     //   VALUES (${name}, ${dob}, ${hashedPassword}, ${username}, ${department}, ${contactNumber}, ${avatar}, ${email}, ${section}, ${gender}, ${batch}, ${fatherName}, ${motherName}, ${fatherContactNumber}, ${motherContactNumber}, ${year}, 0)
//     // `;

//     // // Get the newly added student ID
//     // const studentIdResult = await sql.query`
//     //   SELECT SCOPE_IDENTITY() AS id
//     // `;
//     // const newStudentId = studentIdResult.recordset[0].id;


//      const GetInsertRecId = await sql.query`
//   INSERT INTO Student (name, dob, password, username, department, contactNumber, avatar, email, section, gender, batch, fatherName, motherName, fatherContactNumber, motherContactNumber, year, passwordUpdated)
//   OUTPUT INSERTED.id
//   VALUES (${name}, ${dob}, ${hashedPassword}, ${username}, ${department}, ${contactNumber}, ${avatar}, ${email}, ${section}, ${gender}, ${batch}, ${fatherName}, ${motherName}, ${fatherContactNumber}, ${motherContactNumber}, ${year}, 0)
// `;

// const newStudentId = GetInsertRecId.recordset[0].id;

// console.log("New Student ID:", newStudentId);

//     // Get subjects for the department and year
//     const subjectsResult = await sql.query`
//       SELECT _id FROM Subject WHERE department = ${department} AND year = ${year}
//     `;
//     const subjects = subjectsResult.recordset;

//     // Insert subjects for the student
//     for (const subject of subjects) {
//       await sql.query`
//         INSERT INTO StudentSubjects (studentId, subjectId)
//         VALUES (${newStudentId}, ${subject._id})
//       `;
//     }



//     res.status(200).json({
//       success: true,
//       message: 'Student registered successfully',
//       response: { id: newStudentId, username, email }
//     });
//   } catch (error) {
//     console.error('Error adding student: here', error.message);
//     res.status(500).json({ backendError: error.message });
//   } finally {
//     // Close the connection
//     sql.close();
//   }


try {
  const {
    name,
    dob,
    department,
    contactNumber,
    avatar,
    email,
    section,
    gender,
    batch,
    fatherName,
    motherName,
    fatherContactNumber,
    motherContactNumber,
    year,
  } = req.body;

  if (!name || !dob || !department || !contactNumber || !email || !section || !gender || !batch || !fatherName || !motherName || !fatherContactNumber || !motherContactNumber || !year) {
    console.log('Validation failed: Missing fields');
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Connect to the database
  await sql.connect(sqlConfig);
  console.log('Database connected');

  // Check if student already exists
  const studentCheckResult = await sql.query`
    SELECT * FROM Student WHERE email = ${email}
  `;
  if (studentCheckResult.recordset.length > 0) {
    console.log('Email already exists');
    return res.status(400).json({ emailError: 'Email already exists' });
  }
  console.log('Email check passed');

  // Check if department exists
  const departmentResult = await sql.query`
    SELECT departmentCode FROM Departments WHERE department = ${department}
  `;
  if (departmentResult.recordset.length === 0) {
    console.log('Department does not exist');
    return res.status(400).json({ departmentError: 'Department does not exist' });
  }
  const departmentHelper = departmentResult.recordset[0].departmentCode;
  console.log('Department check passed');

  // Generate username
  const studentsCountResult = await sql.query`
    SELECT COUNT(*) AS count FROM Student WHERE department = ${department}
  `;
  const studentsCount = studentsCountResult.recordset[0].count;
  const helper = studentsCount < 10 ? `00${studentsCount}` : studentsCount < 100 ? `0${studentsCount}` : `${studentsCount}`;
  const date = new Date();
  const username = `STU${date.getFullYear()}${departmentHelper}${helper}`;
  console.log('Username generated:', username);

  // Hash password
  const newDob = dob.split('-').reverse().join('-');
  const hashedPassword = await bcrypt.hash(newDob, 10);
  console.log('Password hashed');

  // Insert new student and get the new student ID
  const insertStudentResult = await sql.query`
    INSERT INTO Student (name, dob, password, username, department, contactNumber, avatar, email, section, gender, batch, fatherName, motherName, fatherContactNumber, motherContactNumber, year, passwordUpdated)
    OUTPUT INSERTED.id
    VALUES (${name}, ${dob}, ${hashedPassword}, ${username}, ${department}, ${contactNumber}, ${avatar}, ${email}, ${section}, ${gender}, ${batch}, ${fatherName}, ${motherName}, ${fatherContactNumber}, ${motherContactNumber}, ${year}, 0)
  `;
  const newStudentId = insertStudentResult.recordset[0].id;
  console.log('New student ID:', newStudentId);

  // Get subjects for the department and year
  const subjectsResult = await sql.query`
    SELECT subjectCode FROM Subject WHERE department = ${department} AND year = ${year}
  `;
  const subjects = subjectsResult.recordset;
  console.log('Subjects retrieved:', subjects);

  // Insert subjects for the student
  for (const subject of subjects) {
    await sql.query`
      INSERT INTO StudentSubjects (studentId, subjectCode)
      VALUES (${newStudentId}, ${subject.subjectCode})
    `;
  }
  console.log('Subjects inserted for student');

  res.status(200).json({
    success: true,
    message: 'Student registered successfully',
    response: { id: newStudentId, username, email }
  });
} catch (error) {
  console.error('Error adding student:', error.message);
  res.status(500).json({ backendError: error.message });
} finally {
  // Close the connection
  sql.close().then(() => console.log('Database connection closed')).catch(err => console.error('Error closing connection:', err.message));
}



};
// export const getStudent = async (req, res) => {
//   try {
//     const { department, year, section } = req.body;
//     const errors = { noStudentError: String };
//     const students = await Student.find({ department, year });

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
export const getStudent = async (req, res) => {
  try {
    const { department, year, section } = req.body;

    // Connect to the database
    await sql.connect(sqlConfig);

    // Query for students
    const result = await sql.query`
      SELECT * FROM Student WHERE department = ${department} AND year = ${year}
    `;
    const students = result.recordset;

    if (students.length === 0) {
      return res.status(404).json({ noStudentError: "No Student Found" });
    }

    // Return students
    res.status(200).json({ result: students });
  } catch (error) {
    console.error('Error getting students:', error.message);
    res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};
// export const getAllStudent = async (req, res) => {
//   try {
//     const students = await Student.find();
//     res.status(200).json(students);
//   } catch (error) {
//     console.log("Backend Error", error);
//   }
// };
export const getAllStudent = async (req, res) => {
  try {
    // Connect to the database
    await sql.connect(sqlConfig);

    // Query to fetch all students
    const result = await sql.query`
      SELECT * FROM Student
    `;
    const students = result.recordset;

    res.status(200).json(students);
  } catch (error) {
    console.error("Backend Error", error.message);
    res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};

// export const getAllFaculty = async (req, res) => {
//   try {
//     const faculties = await Faculty.find();
//     res.status(200).json(faculties);
//   } catch (error) {
//     console.log("Backend Error", error);
//   }
// };
export const getAllFaculty = async (req, res) => {
  try {
    // Connect to the database
    await sql.connect(sqlConfig);

    // Query to fetch all faculty members
    const result = await sql.query`
      SELECT * FROM Faculty
    `;
    const faculties = result.recordset;

    res.status(200).json(faculties);
  } catch (error) {
    console.error("Backend Error", error.message);
    res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};
// export const getAllAdmin = async (req, res) => {
//   try {
//     const admins = await Admin.find();
//     res.status(200).json(admins);
//   } catch (error) {
//     console.log("Backend Error", error);
//   }
// };
export const getAllAdmin = async (req, res) => {
  try {
    // Connect to the database
    await sql.connect(sqlConfig);

    // Query to fetch all admin members
    const result = await sql.query`
      SELECT * FROM Admins
    `;
    const admins = result.recordset;

    res.status(200).json(admins);
  } catch (error) {
    console.error("Backend Error", error.message);
    res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};
// export const getAllDepartment = async (req, res) => {
//   try {
//     const departments = await Department.find();
//     res.status(200).json(departments);
//   } catch (error) {
//     console.log("Backend Error", error);
//   }
// };
export const getAllDepartment = async (req, res) => {
  try {
    // Connect to the database
    await sql.connect(sqlConfig);

    // Query to fetch all departments
    const result = await sql.query`
      SELECT * FROM Departments
    `;
    const departments = result.recordset;

    res.status(200).json(departments);
  } catch (error) {
    console.error("Backend Error", error.message);
    res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};
// export const getAllSubject = async (req, res) => {
//   try {
//     const subjects = await Subject.find();
//     res.status(200).json(subjects);
//   } catch (error) {
//     console.log("Backend Error", error);
//   }
// };
export const getAllSubject = async (req, res) => {
  try {
    // Connect to the database
    await sql.connect(sqlConfig);

    // Query to fetch all subjects
    const result = await sql.query`
      SELECT * FROM Subject
    `;
    const subjects = result.recordset;

    res.status(200).json(subjects);
  } catch (error) {
    console.error("Backend Error", error.message);
    res.status(500).json({ backendError: error.message });
  } finally {
    // Close the connection
    sql.close();
  }
};