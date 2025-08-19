const express = require('express');
const app = express();
const employeeController = require('./controllers/employeeController');
const loginController = require('./controllers/loginController');
const weeklyReportController = require('./controllers/weeklyReportController');
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
    database: process.env.DB_NAME,
  },
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
  },
};
app.use(helmet());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(morgan('combined'));

//ルーター
app.get('/', (req, res) => res.send('APIサーバー起動中'));

/* ログインAPI */
app.post('/login', (req, res) => 
  loginController.getLoginData(req, res, db)
);

/* 社員一覧取得API */
app.get('/employee/get', (req, res) =>
  employeeController.getEmployeeList(req, res, db)
);

/* 週報基本情報取得API */
app.get('/reportsInfo', (req, res) =>
  weeklyReportController.getBaseData(req, res, db)
);

/* 週報一覧取得API */
app.get('/reports', (req, res) =>
  weeklyReportController.getWeeklyReportList(req, res, db)
);

/* 週報詳細情報取得API */
app.get('/reports/reportDetail', (req, res) =>
  weeklyReportController.getDetailData(req, res, db)
);

/* チームLDリスト取得API */
app.get('/getTld', (req, res) => 
  employeeController.getLeaders(req, res, db)
);

/* 営業社員リスト取得API */
app.get('/getSalesEmployee', (req, res) =>
  employeeController.getSalesEmployees(req, res, db)
);

/* 週報コピー情報取得API */
app.get('/reports/reportRegister/copy', (req, res) =>
  weeklyReportController.getLatestReport(req, res, db)
);

/* 週報情報登録API */
app.post('/reports/reportRegister', (req, res) =>
  weeklyReportController.submitReport(req, res, db)
);

/* 週報情報更新API */
app.put('/reports/reportRegister', (req, res) =>
  weeklyReportController.editReport(req, res, db)
);

//週報詳細情報取得
app.get('/reports/reportDetail', (req, res) =>
  reportDetailController.getDetailData(req, res, db)
);

//サーバ接続
app.listen(process.env.API_PORT, () => {
  console.log(`port ${process.env.API_PORT}`);
});
