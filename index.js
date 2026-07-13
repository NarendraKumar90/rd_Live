require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// database connection
const pool = new Pool({
 connectionString: process.env.DATABASE_URL,

});

// test route
app.get("/", async (req, res) => {
 try {
   const result = await pool.query("SELECT NOW()");
   res.json({
     message: "Connected to rdapp Naren!",
     time: result.rows[0],
   });
 } catch (err) {
   console.error(err);
   res.status(500).send(err.message);
 }
});
//=============

app.get("/tranById/:rid", async (req, res) => {
    try {

        const { rid } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM transactions
             WHERE user_id = $1
             ORDER BY tid DESC`,
            [rid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "No Transactions Found"
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "Transactions fetched successfully",
            data: result.rows
        });

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Server Error"
        });

    }
});

app.get("/rduserById/:rid", async (req, res) => {
    try {

        const { rid } = req.params;

        const result = await pool.query(
            "SELECT * FROM rd_user WHERE rid = $1",
            [rid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "User Not Found"
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "User Found",
            data: result.rows[0]
        });

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Server Error"
        });

    }
});

//total fine
app.get("/totalfine", async (req, res) => {
    try {

        const result = await pool.query(
            "SELECT COALESCE(SUM(fine_amount), 0) AS total_fine FROM transactions"
        );

        res.status(200).json({
            status: 200,
            success: true,
            message: "Total Fine Amount",
            data: Number(result.rows[0].total_fine)
        });

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Server Error"
        });

    }
});



app.get('/transactionById', async (req, res) => {
    try {
        const { tid } = req.body;

        const result = await pool.query(
            "SELECT * FROM transactions WHERE tid = $1",
            [tid]
        );

        if (result.rows.length === 0) {
            return res.status(404).send({
                status: "404",
                message: "Transaction Not Found"
            });
        }

        res.send({
            status: "200",
            transaction: result.rows[0]
        });

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});


//Rd get Api

app.get("/rduser", async (req, res) => {
    try {

        const result = await pool.query(
            "SELECT * FROM rd_user ORDER BY rid DESC"
        );

        res.status(200).json({
            status: 200,
            success: true,
            message: "Users fetched successfully",
            data: result.rows
        });

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Server Error"
        });

    }
});

app.get('/passbookById/:pid', async(req,res)=>{
    try{

        const {pid}=req.params;

        const result=await pool.query(
            "SELECT * FROM rd_passbook WHERE pid=$1",
            [pid]
        );

        if(result.rows.length===0){
            return res.status(404).json({
                status:404,
                success:false,
                message:"Passbook Not Found"
            });
        }

        res.status(200).json({
            status:200,
            success:true,
            message:"Passbook Found",
            data:result.rows[0]
        });

    }catch(err){
        console.log(err.message);
        res.status(500).json({
            status:500,
            success:false,
            message:"Server Error"
        });
    }
});

// app.get('/passbookById', async (req, res) => {
//     try {
//         const { pid } = req.body;

//         const result = await pool.query(
//             "SELECT * FROM rd_passbook WHERE pid = $1",
//             [pid]
//         );

//         if (result.rows.length === 0) {
//             return res.status(404).send({
//                 status: "404",
//                 message: "Passbook Record Not Found"
//             });
//         }

//         res.send({
//             status: "200",
//             passbook: result.rows[0]
//         });

//     } catch (err) {
//         console.log(err.message);
//         res.status(500).send("Server Error");
//     }
// });

//post Api
app.post("/addrduser", async (req, res) => {
    try {

        const {
            name,
            mob,
            address,
            dob,
            gender,
            rdamt,
            rddate,
            occupation,
            acno,
            adharno,
            panno,
            nname,
            nadhar,
            npano,
            agree
        } = req.body;

        // Check duplicate Account No or Aadhaar No
        const check = await pool.query(
            `SELECT * FROM rd_user
             WHERE acno = $1 OR adharno = $2`,
            [acno, adharno]
        );

        if (check.rows.length > 0) {
            return res.status(409).json({
                status: 409,
                success: false,
                message: "Account Number or Aadhaar Number already exists"
            });
        }

        const result = await pool.query(
            `INSERT INTO rd_user
            (
                name,
                mob,
                address,
                dob,
                gender,
                rdamt,
                rddate,
                occupation,
                acno,
                adharno,
                panno,
                nname,
                nadhar,
                npano,
                agree
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,
                $9,$10,$11,$12,$13,$14,$15
            )
            RETURNING *`,
            [
                name,
                mob,
                address,
                dob,
                gender,
                rdamt,
                rddate,
                occupation,
                acno,
                adharno,
                panno,
                nname,
                nadhar,
                npano,
                agree
            ]
        );

        res.status(201).json({
            status: 201,
            success: true,
            message: "User Saved Successfully",
            data: result.rows[0]
        });

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Server Error"
        });

    }
});

//put

app.put("/updaterduser", async (req, res) => {
    try {

        const {
            rid,
            name,
            mob,
            address,
            dob,
            gender,
            rdamt,
            rddate,
            occupation,
            acno,
            adharno,
            panno,
            nname,
            nadhar,
            npano,
            agree
        } = req.body;

        // Check user exists
        const checkUser = await pool.query(
            "SELECT * FROM rd_user WHERE rid=$1",
            [rid]
        );

        if (checkUser.rows.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "User Not Found"
            });
        }

        // Check duplicate Account No or Aadhaar No (except current user)
        const duplicate = await pool.query(
            `SELECT *
             FROM rd_user
             WHERE (acno=$1 OR adharno=$2)
             AND rid<>$3`,
            [acno, adharno, rid]
        );

        if (duplicate.rows.length > 0) {
            return res.status(409).json({
                status: 409,
                success: false,
                message: "Account Number or Aadhaar Number already exists"
            });
        }

        const result = await pool.query(
            `UPDATE rd_user SET
                name=$1,
                mob=$2,
                address=$3,
                dob=$4,
                gender=$5,
                rdamt=$6,
                rddate=$7,
                occupation=$8,
                acno=$9,
                adharno=$10,
                panno=$11,
                nname=$12,
                nadhar=$13,
                npano=$14,
                agree=$15
            WHERE rid=$16
            RETURNING *`,
            [
                name,
                mob,
                address,
                dob,
                gender,
                rdamt,
                rddate,
                occupation,
                acno,
                adharno,
                panno,
                nname,
                nadhar,
                npano,
                agree,
                rid
            ]
        );

        res.status(200).json({
            status: 200,
            success: true,
            message: "User Updated Successfully",
            data: result.rows[0]
        });

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Server Error"
        });

    }
});

// app.put('/updaterduser', async(req,res)=>{
//     try{

//         const {
//             rid,name,mob,address,dob,gender,rdamt,rddate,
//             occupation,acno,adharno,panno,nname,nadhar,npano,agree
//         } = req.body;

// const result=await pool.query(
// `UPDATE rd_user SET
// name=$1,
// mob=$2,
// address=$3,
// dob=$4,
// gender=$5,
// rdamt=$6,
// rddate=$7,
// occupation=$8,
// acno=$9,
// adharno=$10,
// panno=$11,
// nname=$12,
// nadhar=$13,
// npano=$14,
// agree=$15
// WHERE rid=$16
// RETURNING *`,
// [
// name,mob,address,dob,gender,rdamt,rddate,occupation,
// acno,adharno,panno,nname,nadhar,npano,agree,rid
// ]);

// res.status(200).json({
//     status:200,
//     success:true,
//     message:"Updated Successfully",
//     data:result.rows[0]
// });
// });

//Delete

app.delete("/deleterduser/:rid", async (req, res) => {
    try {

        const { rid } = req.params;

        // Check if user exists
        const check = await pool.query(
            "SELECT * FROM rd_user WHERE rid=$1",
            [rid]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "User Not Found"
            });
        }

        await pool.query(
            "DELETE FROM rd_user WHERE rid=$1",
            [rid]
        );

        res.status(200).json({
            status: 200,
            success: true,
            message: "User Deleted Successfully"
        });

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Server Error"
        });

    }
});

// app.delete('/deleterduser', async(req,res)=>{
//     try{
//         [rid]=req.body;
// const {rid}=req.params;

// await pool.query(
// "DELETE FROM rd_user WHERE rid=$1",
// [rid]
// );

// res.status(200).json({
//     status:200,
//     success:true,
//     message:"Deleted Successfully"
// });
// });

//rd Passbook

app.get("/passbook", async (req, res) => {
    try {

        const result = await pool.query(
            "SELECT * FROM rd_passbook ORDER BY pid DESC"
        );

        res.status(200).json({
            status: 200,
            success: true,
            message: "Passbook Records Fetched Successfully",
            data: result.rows
        });

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Server Error"
        });

    }
});

//post



app.post("/addpassbook", async (req, res) => {
    try {

        const {
            rid,
            p_rdamt,
            p_rddate,
            late_days,
            fine_amt,
            is_shtl
        } = req.body;

        // Check RD User exists
        const user = await pool.query(
            "SELECT * FROM rd_user WHERE rid=$1",
            [rid]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "RD User Not Found"
            });
        }

        const result = await pool.query(
            `INSERT INTO rd_passbook
            (
                rid,
                p_rdamt,
                p_rddate,
                late_days,
                fine_amt,
                is_shtl
            )
            VALUES
            ($1,$2,$3,$4,$5,$6)
            RETURNING *`,
            [
                rid,
                p_rdamt,
                p_rddate,
                late_days,
                fine_amt,
                is_shtl
            ]
        );

        res.status(201).json({
            status: 201,
            success: true,
            message: "Passbook Entry Added Successfully",
            data: result.rows[0]
        });

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Server Error"
        });

    }
});

//put

app.put("/updatepassbook", async (req, res) => {
    try {

        const {
            pid,
            rid,
            p_rdamt,
            p_rddate,
            late_days,
            fine_amt,
            is_shtl
        } = req.body;

        // Check Passbook Record Exists
        const passbook = await pool.query(
            "SELECT * FROM rd_passbook WHERE pid=$1",
            [pid]
        );

        if (passbook.rows.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Passbook Record Not Found"
            });
        }

        // Check RD User Exists
        const user = await pool.query(
            "SELECT * FROM rd_user WHERE rid=$1",
            [rid]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "RD User Not Found"
            });
        }

        const result = await pool.query(
            `UPDATE rd_passbook SET
                rid=$1,
                p_rdamt=$2,
                p_rddate=$3,
                late_days=$4,
                fine_amt=$5,
                is_shtl=$6
            WHERE pid=$7
            RETURNING *`,
            [
                rid,
                p_rdamt,
                p_rddate,
                late_days,
                fine_amt,
                is_shtl,
                pid
            ]
        );

        res.status(200).json({
            status: 200,
            success: true,
            message: "Passbook Updated Successfully",
            data: result.rows[0]
        });

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Server Error"
        });

    }
});

//delete

app.delete("/deletepassbook/:pid", async (req, res) => {
    try {

        const { pid } = req.params;

        // Check Passbook Record Exists
        const check = await pool.query(
            "SELECT * FROM rd_passbook WHERE pid=$1",
            [pid]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Passbook Record Not Found"
            });
        }

        await pool.query(
            "DELETE FROM rd_passbook WHERE pid=$1",
            [pid]
        );

        res.status(200).json({
            status: 200,
            success: true,
            message: "Passbook Deleted Successfully"
        });

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Server Error"
        });

    }
});

//transaction 

app.get("/transactions", async (req, res) => {
    try {

        const result = await pool.query(
            "SELECT * FROM transactions ORDER BY tid DESC"
        );

        res.status(200).json({
            status: 200,
            success: true,
            message: "Transactions fetched successfully",
            data: result.rows
        });

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Server Error"
        });

    }
});

//post

app.post("/addtransaction", async (req, res) => {
    try {

        const {
            user_id,
            due_date,
            installment_amount,
            paid_amount,
            fine_amount,
            status,
            paid_date
        } = req.body;

        // Check User Exists
        const user = await pool.query(
            "SELECT * FROM rd_user WHERE rid=$1",
            [user_id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "RD User Not Found"
            });
        }

        const result = await pool.query(
            `INSERT INTO transactions
            (
                user_id,
                due_date,
                installment_amount,
                paid_amount,
                fine_amount,
                status,
                paid_date
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *`,
            [
                user_id,
                due_date,
                installment_amount,
                paid_amount,
                fine_amount,
                status,
                paid_date
            ]
        );

        res.status(201).json({
            status: 201,
            success: true,
            message: "Transaction Added Successfully",
            data: result.rows[0]
        });

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Server Error"
        });

    }
});

//update

app.put("/updatetransaction", async (req, res) => {
    try {

        const {
            tid,
            user_id,
            due_date,
            installment_amount,
            paid_amount,
            fine_amount,
            status,
            paid_date
        } = req.body;

        // Check Transaction Exists
        const transaction = await pool.query(
            "SELECT * FROM transactions WHERE tid=$1",
            [tid]
        );

        if (transaction.rows.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Transaction Not Found"
            });
        }

        // Check RD User Exists
        const user = await pool.query(
            "SELECT * FROM rd_user WHERE rid=$1",
            [user_id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "RD User Not Found"
            });
        }

        const result = await pool.query(
            `UPDATE transactions SET
                user_id=$1,
                due_date=$2,
                installment_amount=$3,
                paid_amount=$4,
                fine_amount=$5,
                status=$6,
                paid_date=$7
            WHERE tid=$8
            RETURNING *`,
            [
                user_id,
                due_date,
                installment_amount,
                paid_amount,
                fine_amount,
                status,
                paid_date,
                tid
            ]
        );

        res.status(200).json({
            status: 200,
            success: true,
            message: "Transaction Updated Successfully",
            data: result.rows[0]
        });

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Server Error"
        });

    }
});

//Delete
app.delete("/deletetransaction/:tid", async (req, res) => {
    try {

        const { tid } = req.params;

        // Check Transaction Exists
        const transaction = await pool.query(
            "SELECT * FROM transactions WHERE tid = $1",
            [tid]
        );

        if (transaction.rows.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Transaction Not Found"
            });
        }

        await pool.query(
            "DELETE FROM transactions WHERE tid = $1",
            [tid]
        );

        res.status(200).json({
            status: 200,
            success: true,
            message: "Transaction Deleted Successfully"
        });

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Server Error"
        });

    }
});

//Logins

app.post("/logins", async (req, res) => {
    try {

        const { adharno, acno } = req.body;

        // Validate input
        if (!adharno || !acno) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Aadhaar Number and Account Number are required"
            });
        }

        const result = await pool.query(
            `SELECT *
             FROM rd_user
             WHERE adharno = $1
             AND acno = $2`,
            [adharno, acno]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                status: 401,
                success: false,
                message: "Invalid Aadhaar Number or Account Number"
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "Login Successful",
            data: result.rows[0]
        });

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Server Error"
        });

    }
});

// app.post('/logins', async (req, res) => {
//     try {

//         const { adharno, acno } = req.body;

//         const result = await pool.query(
//             `SELECT *
//              FROM rd_user
//              WHERE adharno = $1
//              AND acno = $2`,
//             [adharno, acno]
//         );

//         if (result.rows.length > 0) {
//             res.send({
//                 status: "200",
//                 message: "Login Success",
//                 user: result.rows[0]
//             });
//         } else {
//             res.status(401).send({
//                 status: "401",
//                 message: "Invalid Aadhaar Number or Account Number"
//             });
//         }

//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send({
//             status: "500",
//             message: "Server Error"
//         });
//     }
// });
//========================================================


//Menu get Api
// API for select orders
app.get('/orders', async (req, res) => {
    try {
      console.log("Fetching data from menu table..."); // Log to check if the request is reaching here
      
      // Execute the query to fetch data from the 'menu' table
      const result = await pool.query("SELECT * FROM orders order by id desc");
      
      // Log result to check what is fetched
      console.log("Fetched data: ", result.rows);
      
      // Send the fetched data as a JSON response
      res.json({ orders: result.rows });
    } catch (err) {
      // Log detailed error message
      console.error("Error fetching data from menu table:", err.message);
  
      // Check if error is related to database connection
      if (err.code === 'ECONNREFUSED') {
        return res.status(500).send('Database connection error');
      }
  
      // Default server error response
      res.status(500).send('Server Error');
    }
  });


// API for select data

app.get('/mwc', async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                menu.mid,
                menu.mname,
                menu.price,
                food_cat.category,
                menu.description,
                menu.image
            FROM menu
            INNER JOIN food_cat
                ON menu.fid = food_cat.fid
            ORDER BY menu.mid DESC
        `);

        res.status(200).json({
            status: 200,
            menu: result.rows
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            status: 500,
            message: "Server Error"
        });
    }
});


// app.get('/mwc', async (req, res) => {
//     try {

//         const result = await pool.query(`
//             SELECT
//                 mid,
//                 mname,
//                 price,
//                 category
//             FROM menu
//             INNER JOIN food_cat
//             ON menu.fid = food_cat.fid
//             ORDER BY mid DESC
//         `);

//         res.status(200).json({
//             status: 200,
//             menu: result.rows
//         });

//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json({
//             status: 500,
//             message: "Server Error"
//         });
//     }
// });


app.get('/menu', async (req, res) => {
    try {
      console.log("Fetching data from menu table..."); // Log to check if the request is reaching here
      
      // Execute the query to fetch data from the 'menu' table
      const result = await pool.query("SELECT * FROM menu order by mid desc");
      
      // Log result to check what is fetched
      console.log("Fetched data: ", result.rows);
      
      // Send the fetched data as a JSON response
      res.json({ menu: result.rows });
    } catch (err) {
      // Log detailed error message
      console.error("Error fetching data from menu table:", err.message);
  
      // Check if error is related to database connection
      if (err.code === 'ECONNREFUSED') {
        return res.status(500).send('Database connection error');
      }
  
      // Default server error response
      res.status(500).send('Server Error');
    }
  });


    app.get('/menucard',async(req,res)=>{
    var result=await pool.query("select mid, mname,price,category,psize from menu,food_cat,qty_mast where menu.fid=food_cat.fid and menu.qid=qty_mast.qid")
    res.json({menu:result.rows});
    });

    // count API
     app.get('/cnt',async(req,res)=>{
        try{
    var result=await pool.query('SELECT  (SELECT COUNT(*) FROM menu) AS menu_count,  (SELECT COUNT(*) FROM food_cat) AS food_cat_count,   (SELECT COUNT(*)  FROM qty_mast) AS qty_mast_count; ')
    res.json(result.rows[0]);
        }catch(err){
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    })


app.get('/foodcat',async(req,res)=>{
        var result=await pool.query("select * from food_cat order by fid desc")
        res.json({food_cat:result.rows});
        });
     

app.get('/qty',async(req,res)=>{
        var result=await pool.query("select * from qty_mast order by qid desc")
        res.json({qty:result.rows});
        });
             

        app.get('/menuById',async(req,res)=>{
            // const {iid}=req.params;
            var {id}=req.body
            var result=await pool.query("select * from menu where mid=$1",[id])
            res.json({menu:result.rows});
            });


         // API for add data
           
         // app.post('/addmenu',async(req,res)=>{
         //   try{
         //    const{mname,price,fid,qid}=req.body
         //    const result=await pool.query('INSERT INTO menu(mname,price,fid,qid) VALUES ($1,$2,$3,$4) RETURNING *',[mname,price,fid,qid]);
         //    res.send({status:"200",menu:"save success"});
         //   }catch(err){
         //      console.error(err.message);
         //      res.status(500).send('Server Error')
         //   }
         //    });

         //      app.post('/addqty',async(req,res)=>{
         //   try{
         //    const{psize}=req.body
         //    const result=await pool.query('INSERT INTO qty_mast(psize) VALUES ($1) RETURNING *',[psize]);
         //    res.send({status:"200",menu:"save success"});
         //   }catch(err){
         //      console.error(err.message);
         //      res.status(500).send('Server Error')
         //   }
         //    });

app.post('/addmenu', async (req, res) => {
  try {
    const { mname, price, fid, qid, description, image } = req.body;

    const result = await pool.query(
      `INSERT INTO menu
      (mname, price, fid, qid, description, image)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [mname, price, fid, qid, description, image]
    );

    res.status(200).json({
      status: 200,
      message: "Menu saved successfully",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});



//    API FOR ADD FOOD_CATEGORY


app.post('/addOrder', async (req, res) => {
  try {
    const { table_no, items, status,paid_amt } = req.body;

    if (!table_no || !items || items.length === 0) {
      return res.send({ status: 400, message: "Missing data" });
    }

    const result = await pool.query(
      `INSERT INTO orders (table_no, items, status,paid_amt ,date)
       VALUES ($1, $2, $3,$4, NOW())
       RETURNING *`,
      [table_no, JSON.stringify(items), status,paid_amt || "pending"]
    );

    res.send({
      status: 200,
      message: "Order Added",
      order: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ status: 500, message: "Server Error" });
  }
});


app.post('/addfood', async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ status: 400, message: "Category is required" });
    }

    const result = await pool.query(
      'INSERT INTO food_cat (category) VALUES ($1) RETURNING *',
      [category]
    );

    res.status(200).json({ status: 200, message: "Save success", data: result.rows[0] });

  } catch (err) {
    console.error("AddFood Error:", err.message);
    res.status(500).json({ status: 500, message: 'Server Error' });
  }
});


     // Login API

    app.post('/login',async(req,res)=>{
           try{
            const{uname,pwd}=req.body
            const result=await pool.query('select uname,pwd from admin where uname=$1 and pwd=$2', [uname,pwd]);
            res.send({status:"200",menu:"Login Success"});
           }catch(err){
              console.error(err.message);
              res.status(500).send('Server Error')
           }
            });


              // API for update data
           
         // app.put('/updatemenu',async(req,res)=>{
         //    try{
         //     const{mid,mname,price,fid,qid}=req.body;
         //     const result=await pool.query(
         //    'UPDATE menu SET mname=$1, price=$2, fid=$3, qid=$4 WHERE mid=$5 RETURNING *',
         //    [mname,price,fid,qid,mid]);
             
         //      res.status(200).json({
         //      status: 200,
         //      message: "Update success",
         //      data: result.rows[0]
         //       });
  
         //    }catch(err){
         //       console.error(err.message);
         //       res.status(500).send('Server Error')
         //    }
         //     });

app.put('/updatemenu', async (req, res) => {
  try {
    const {
      mid, mname, price, fid, qid,  description,  image } = req.body;

    const result = await pool.query(
      `UPDATE menu
       SET
         mname = $1,
         price = $2,
         fid = $3,
         qid = $4,
         description = $5,
         image = $6
       WHERE mid = $7
       RETURNING *`,
      [mname, price, fid, qid, description, image, mid]
    );

    res.status(200).json({
      status: 200,
      message: "Update success",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

         // UPDATE QYANTITY

             app.put('/updateqty',async(req,res)=>{
                try{
                 const{qid,psize}=req.body;
                 const result=await pool.query(
                'UPDATE qty_mast SET psize=$1 WHERE qid=$2 RETURNING *',
                [psize,qid]);
                 res.send({status:"200",qty:"update success"});
                }catch(err){
                   console.error(err.message);
                   res.status(500).send('Server Error')
                }
                 });

             // UPDATE CATEGORY
app.put('/updatecat', async (req, res) => {
  try {
    const { fid, category } = req.body;

    if (!fid || !category) {
      return res.status(400).json({ status: 400, message: "fid and category are required" });
    }

    const result = await pool.query(
      'UPDATE food_cat SET category = $1 WHERE fid = $2 RETURNING *',
      [category, fid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ status: 404, message: "Category not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Update success",
      data: result.rows[0]
    });

  } catch (err) {
    console.error("Update Category Error:", err.message);
    res.status(500).json({ status: 500, message: "Server Error" });
  }
});


 
         // API for delete data

   app.delete('/delmenuById/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM menu WHERE mid=$1", [id]);
    res.send({ status: 200, menu: "delete success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, error: "Internal Server Error" });
  }
});

           
        

                // del qid

                  app.delete('/delqtyById',async(req,res)=>{
                try{
                // const {iid}=req.params;
                var {id}=req.body
                var result=await pool.query("delete from qty_mast where qid=$1",[id])
                res.send({status:"200",qty:"delete success"});
                // res.json({status:200,menu:"delete success"});
                }catch(err){
                    console.log(err);
                }
                // res.send({status:"200",message:"delete success"});
                });  



                     // DELETE API FOR FOOD CATEGORY
                     app.delete('/delfoodById', async (req, res) => {
                      try {
                    
                          // const {iid}=req.params;
                          var {id}=req.body
                          var result=await pool.query("delete from food_cat where fid=$1",[id])
                          res.send({status:"200",cat:"delete success"});
                          // res.json({status:200,menu:"delete success"});
                          }catch(err){
                              console.log(err);
                          }
                          // res.send({status:"200",message:"delete success"});
                          });  




// server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
 console.log("Server running on port", PORT);
});
