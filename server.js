const express = require('express');
const app = express();
const employeeController = require('./controllers/employeeController');
require('dotenv').config();

//ミドルウェアを設定する
const cors = require('cors'); //CORS(Cross-Origin Resource Sharing)を有効にする
const bodyParser = require('body-parser'); //レスポンスのフォーマットを変換する
const morgan = require('morgan'); //HTTPレクエストロガー
const helmet = require('helmet'); //Cross-Site-Scripting(XSS)のような攻撃を防ぐ

// knexを使ってdbに接続する
var db = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  }
});

//ミドルウェア
const whitelist = [`http://${process.env.APP_HOST}:${process.env.APP_PORT}`];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}
app.use(helmet());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(morgan('combined'));

//ルーター
app.get('/', (req, res) => res.send('APIサーバー起動中'));

/* 社員マスタ */
//取得
app.get('/employee/get', (req, res) => employeeController.getData(req, res, db));
//最大社員ID取得
app.get('/employee/getMaxEmpId', (req, res) => employeeController.getMaxEmpId(req, res, db));
//追加
app.post('/employee/post', (req, res) => employeeController.postData(req, res, db));
//更新
app.put('/employee/put', (req, res) => employeeController.putData(req, res, db));
//削除
app.delete('/employee/delete', (req, res) => employeeController.delData(req, res, db));

//サーバ接続
app.listen(process.env.API_PORT, () => {
  console.log(`port ${process.env.API_PORT}`);
});
