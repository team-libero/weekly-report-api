/* ログインAPI */
const getLoginData = (req, res, db) => {
  db.select(
    'login.emp_id',
    'employee_mst.role',
    'employee_mst.department_id',
    'employee_mst.emp_lname',
    'employee_mst.emp_fname',
    'department_mst.department_name',
    'team_mst.team_name'
  )
    .from('login')
    .innerJoin('employee_mst', 'login.emp_id', 'employee_mst.emp_id')
    .innerJoin(
      'department_mst',
      'employee_mst.department_id',
      'department_mst.department_id'
    )
    .innerJoin('team_mst', 'employee_mst.team_id', 'team_mst.team_id')
    .where('login.login_id', req.body.user_id)
    .andWhere('login.password', req.body.password)
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
  getLoginData,
};
