/* 社員一覧取得API */
const getEmployeeList = (req, res, db) => {
  db.select(
    'employee_mst.department_id as departmentId',
    'employee_mst.team_id as teamId',
    'employee_mst.role as role',
    'team_mst.unit_no as unitNo'
  )
  .from('employee_mst')
  .leftJoin('team_mst', 'employee_mst.team_id', 'team_mst.team_id')
  .where('employee_mst.emp_id', req.query.employeeId)
  .then((items) => {
    if (items.length) {
      let whereCol;
      let whereVal;
      if (items[0].departmentId == '2') {
        if (items[0].role == '2' || items[0].role == '3') {
          whereCol = 'team_mst.team_id';
          whereVal = items[0].teamId;
        } else if (items[0].role == '4' || items[0].role == '5') {
          whereCol = 'team_mst.unit_no';
          whereVal = items[0].unitNo;
        }
      }

      db.select(
        'team_mst.team_id as teamId',
        'team_mst.team_name as teamName',
        'employee_mst.emp_id as employeeId',
        db.raw('concat(employee_mst.emp_lname, employee_mst.emp_fname) as "name"'),
        'employee_mst.mail_address as mail'
      )
        .from('team_mst')
        .innerJoin('employee_mst', 'team_mst.team_id', 'employee_mst.team_id')
        .where(sub => {
	        if (whereCol) {
		        sub.where(whereCol, whereVal)
	       }
        })
        .orderByRaw('case team_mst.team_id::integer when ' + (items[0].teamId ? items[0].teamId : 0) + ' then 0 else 1 end, team_mst.team_id::integer asc, employee_mst.emp_id::integer asc')
        .then((items) => {
          if (items.length) {
            let teamList = [];
            let team = {};
            items.map((item) => {
              if (!teamList || item.teamId !== team.teamId) {
                if (team && team.teamId && item.teamId !== team.teamId) {
                  teamList.push(team);
                }

                team = {
                  teamId: item.teamId,
                  teamName: item.teamName,
                  employeeList: []
                }
              }
              team.employeeList.push({
                employeeId: item.employeeId,
                name: item.name,
                mail: item.mail
              })
            })
            teamList.push(team);
            res.json({teamList: teamList});
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
    } else {
      res.json({
        dataExists: 'false',
      });
      return;
    }
  })
  .catch((err) =>
    res.status(400).json({
      dbError: 'error',
    })
  );
};

/* チームLDリスト取得API */
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

/* 営業社員リスト取得API */
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
  getEmployeeList,
  getLeaders,
  getSalesEmployees,
};
