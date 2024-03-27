const fastify = require('fastify')({logger:true});

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const {open} = sqlite;
const bycrpt = require('bcrypt')
const data= require('./userData.js')
//console.log("Data",data)
const path = require('path');
const dbPath = path.join(__dirname, './userData.db')

let db = null;
const initalizeDbandServer = async () => {

try{

    db  = await open({
        filename:dbPath,
        driver:sqlite3.Database

    }),

   
fastify.listen({port:3030}, (err,address)=>{
    if (err) throw err
})
}
catch(e){
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
}
}

fastify.register(require('@fastify/jwt'),{
    secret: 'superSecret',
    
})

/*fastify.addContentTypeParser('application/json', function (req, body, done) { 
    try {
        const parsedBody = JSON.parse(body);
        console.log("parsedBody", parsedBody)
        done(null, parsedBody);
    } catch (error) {
        done(error, undefined);
    }
});
*/

// const createDatabase = async(each) => {
//     const query = `INSERT INTO details(userId, id, title, body) VALUES ('${each.userId}','${each.id}', '${each.title}', '${each.body}');`;
//     await db.run(query)
// }

// fastify.put('/createUser', async(req,res)=>{
// data.map(each=>createDatabase(each))
// res.send("Database created")
// })



initalizeDbandServer()


//REGISTER
fastify.post('/register', async(req,res)=>{
    const {username,name,password,gender,location} = req.body;
    //console.log(username);

const isthereQuery = `SELECT * FROM user WHERE username='${username}';`;
//console.log(isthereQuery)

const data = await db.get(isthereQuery)
console.log(data)

if (data !==undefined){
    res.status(400),
    res.send("User Already Exists");
}else{

    const newPassword =await bycrpt.hash(password,10)
    const createQuery = `INSERT INTO user 
    (username,name,password,gender,location)
    VALUES
    ('${username}', '${name}', '${newPassword}', '${gender}', '${location}');
    `;
const dbREsponse = await db.run(createQuery);

res.send(`Created new user with ${dbREsponse.lastID} id`)
}



    res.send("hellos")
})



//LOGIN 
fastify.post('/login',async(req, res)=>{
    const {username,name,password,gender,location} = req.body


    const  isthereQuery = `SELECT * FROM user WHERE username='${username}';`;
    const data = await db.get(isthereQuery)
//console.log(data)

if (data===undefined){
    res.status(400);
    res.send("Please register")
}else{
    const newPassword = await bycrpt.compare(password,data.password)

if (newPassword){
const token = fastify.jwt.sign({username},{expiresIn:10})



    res.status(200),
    res.send({token})


}else{
    res.status(400),
    res.send("Invalid User")
}

}


})

fastify.get('/posts', async(req,res)=>{
// let jwtToken;
// const authHeaders = req.headers["authorization"];

// if (authHeaders!==undefined){
//     jwtToken = authHeaders.split(" ")[1];

// }
// if (jwtToken === undefined){
//     res.status(401);
//     res.send("Invalid Access Token")
// }else{
//     let tokenIsThere;
    
//}
let tokenIsThere
try {
    tokenIsThere = await req.jwtVerify()
  } catch (err) {
    res.send(err)
  }

  if(tokenIsThere!==undefined){
    const query = `SELECT * FROM details`
    const response = await db.all(query);
    //const data  = await response.json();
    
    res.status(200)
  res.send(response)}

  else{
    res.status(401)
    res.send("Invalid JWT Acess Token")
  }

})
