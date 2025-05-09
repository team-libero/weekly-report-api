const getDetailData = (req, res, db) => {
  db.select(
    'emp_info.emp_lname as emp_lname',
    'emp_info.emp_fname as emp_fname',
    'leader_emp_info.emp_lname as leader_emp_lname',
    'leader_emp_info.emp_fname as leader_emp_fname',
    'user_company_name',
    'sales_emp_info.emp_lname as sales_emp_lname',
    'sales_emp_info.emp_fname as sales_emp_fname',
    'prime_contractor_name',
    'onsite_address',
    'fixed_time',
    'source_of_sales_info',
    'how_to_collect_sales_info',
    'sales_info',
    'avg_overtime',
    'work_content',
    'minimun_work_time',
    'reachability'
  )
    .from('weekly_report')
    .innerJoin(
      'employee_mst as emp_info',
      'weekly_report.emp_id',
      'emp_info.emp_id'
    )
    .innerJoin(
      'employee_mst as leader_emp_info',
      'weekly_report.leader_emp_id',
      'leader_emp_info.emp_id'
    )
    .innerJoin(
      'employee_mst as sales_emp_info',
      'weekly_report.sales_emp_id',
      'sales_emp_info.emp_id'
    )
    .where('weekly_report.weekly_report_id', req.query.reportId)
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
  getDetailData,
};
