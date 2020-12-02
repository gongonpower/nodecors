const express = require('express')
const app = express()
const PORT = process.env.PORT || 5000
const cors = require ('cors')
const bodyParser = require('body-parser')

const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('../db/database.db')

const jwt = require('jsonwebtoken')
const md5 = require('md5')

/*
app.use((req, res, next)=>{
    res.header({'Access-Control-Allow-Headers':'Content-Type'})
    next()
})
*/
app.options(cors())
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use((req, res, next)=>{
    console.log(req.headers)
    next()
})
app.use('/student*', cors(), verfyToken)


app.post('/user/login', cors(), (req, res)=>{
    console.log(req.body)
    db.get("SELECT * FROM Users WHERE uid=? AND passwd=?",
        [req.body.uid, md5(req.body.passwd)], (err, row)=>{
            if (row) {
                console.log(row)
                jwt.sign({uid:row['uid']}, 'common_Sercet_Key', (err, authData)=>{
                    if (err) {
                        console.log(err)
                        res.status(401).json({})
                    }
                    else {
                        res.json({authData})
                    }
                }
                )}
            else res.status(403).send()
        }
    )
})

app.all('/test', cors(), (req, res)=>{
    res.json({mesg:'ok'})
})
app.get('/student/:id', (req, res)=>{
    console.log(req.params.id)
    db.all('SELECT * FROM Courses, Enrollment WHERE Courses.code=Enrollment.code AND sid = ?', [req.params.id], (err, rows)=>{
        if (rows) res.json({rows})
        else res.json({rows:[]})
    })
})
app.get('/students', (req, res)=>{
    db.all("SELECT * FROM Students", (err, rows)=>{
        if (rows) res.json({rows})
        else res.json({rows:[]})
    })
})

// verfy user login token
function verfyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !=='undefined') {
        // split the token
        const bearer = bearerHeader.split(' ')
        const bearerToken = bearer[1]
        req.token = bearerToken
        next()
    } else {
        res.sendStatus(403);
    }
}

app.listen(PORT, ()=>{ console.log(`Server running on port:${PORT}`)})