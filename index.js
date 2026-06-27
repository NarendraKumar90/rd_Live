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
     message: "Connected to rdapp!",
     time: result.rows[0],
   });
 } catch (err) {
   console.error(err);
   res.status(500).send(err.message);
 }
});

// get Api
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
           
         app.post('/addmenu',async(req,res)=>{
           try{
            const{mname,price,fid,qid}=req.body
            const result=await pool.query('INSERT INTO menu(mname,price,fid,qid) VALUES ($1,$2,$3,$4) RETURNING *',[mname,price,fid,qid]);
            res.send({status:"200",menu:"save success"});
           }catch(err){
              console.error(err.message);
              res.status(500).send('Server Error')
           }
            });

              app.post('/addqty',async(req,res)=>{
           try{
            const{psize}=req.body
            const result=await pool.query('INSERT INTO qty_mast(psize) VALUES ($1) RETURNING *',[psize]);
            res.send({status:"200",menu:"save success"});
           }catch(err){
              console.error(err.message);
              res.status(500).send('Server Error')
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
           
         app.put('/updatemenu',async(req,res)=>{
            try{
             const{mid,mname,price,fid,qid}=req.body;
             const result=await pool.query(
            'UPDATE menu SET mname=$1, price=$2, fid=$3, qid=$4 WHERE mid=$5 RETURNING *',
            [mname,price,fid,qid,mid]);
             
              res.status(200).json({
              status: 200,
              message: "Update success",
              data: result.rows[0]
               });
  
            }catch(err){
               console.error(err.message);
               res.status(500).send('Server Error')
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
