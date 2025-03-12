const getData = (req, res, db) => {
  db.select('*')
    .from('employee_mst')
    .orderByRaw('emp_id::integer asc')
    .then((items) => {
      if (items.length) {
        res.json(items);
      } else {
        res.json({
          dataExists: 'false',
        });
      }
    })
    .catch((err) =>
      res.status(400).json({
        dbError: 'error',
      })
    );
};

const getMaxEmpId = (req, res, db) => {
  db.select('emp_id')
    .from('employee_mst')
    .orderByRaw('emp_id::integer desc')
    .first()
    .then((item) => {
      if (item) {
        res.json(item);
      } else {
        res.json({
          dataExists: 'false',
        });
      }
    })
    .catch((err) =>
      res.status(400).json({
        dbError: 'error',
      })
    );
};

const postData = (req, res, db) => {
  const {
    emp_id,
    department_id,
    team_id,
    emp_no,
    role,
    emp_lname,
    emp_fname,
    emp_lname_kana,
    emp_fname_kana,
    gender,
    birthday,
    start_date,
    belong,
    emp_status,
    change_date,
    mail_address,
  } = req.body;
  db('employee_mst')
    .insert({
      emp_id,
      department_id,
      team_id,
      emp_no,
      role,
      emp_lname,
      emp_fname,
      emp_lname_kana,
      emp_fname_kana,
      gender,
      birthday,
      start_date,
      belong,
      emp_status,
      change_date,
      mail_address,
    })
    .returning('*')
    .then((item) => {
      res.json(item);
    })
    .catch((err) =>
      res.status(400).json({
        dbError: 'error',
      })
    );
};

const putData = (req, res, db) => {
  const {
    emp_id,
    department_id,
    team_id,
    emp_no,
    role,
    emp_lname,
    emp_fname,
    emp_lname_kana,
    emp_fname_kana,
    gender,
    birthday,
    start_date,
    belong,
    emp_status,
    change_date,
    mail_address,
  } = req.body;
  db('employee_mst')
    .where({ emp_id })
    .update({
      department_id,
      team_id,
      emp_no,
      role,
      emp_lname,
      emp_fname,
      emp_lname_kana,
      emp_fname_kana,
      gender,
      birthday,
      start_date,
      belong,
      emp_status,
      change_date,
      mail_address,
    })
    .returning('*')
    .then((item) => {
      res.json(item);
    })
    .catch((err) =>
      res.status(400).json({
        dbError: 'error',
      })
    );
};

const delData = (req, res, db) => {
  const { emp_id } = req.body;
  db('employee_mst')
    .where({ emp_id })
    .del()
    .then(() => {
      res.json({
        delete: 'true',
      });
    })
    .catch((err) =>
      res.status(400).json({
        dbError: 'error',
      })
    );
};

const getLeaders = (req, res, db) => {
  db.select(
    'employee_mst.emp_id',
    'employee_mst.emp_lname',
    'employee_mst.emp_fname',
    'team_mst.team_id',
    'team_mst.team_name'
  )
    .from('employee_mst')
    .join('team_mst', 'employee_mst.team_id', '=', 'team_mst.team_id')
    .where('employee_mst.role', '!=', '1')
    .orderByRaw('emp_id::integer asc')
    .then((items) => {
      if (items.length) {
        res.json(items);
      } else {
        res.json({
          dataExists: 'false',
        });
      }
    })
    .catch((err) =>
      res.status(400).json({
        dbError: 'error',
      })
    );
};

const getSalesEmployees = (req, res, db) => {
  db.select(
    'employee_mst.emp_id',
    'employee_mst.emp_lname',
    'employee_mst.emp_fname'
  )
    .from('employee_mst')
    .join(
      'department_mst',
      'employee_mst.department_id',
      '=',
      'department_mst.department_id'
    )
    .where('department_mst.department_id', '=', '1')
    .orderByRaw('emp_id::integer asc')
    .then((items) => {
      if (items.length) {
        res.json(items);
      } else {
        res.json({
          dataExists: 'false',
        });
      }
    })
    .catch((err) =>
      res.status(400).json({
        dbError: 'error',
      })
    );
};

module.exports = {
  getData,
  getMaxEmpId,
  postData,
  putData,
  delData,
  getLeaders,
  getSalesEmployees,
};
