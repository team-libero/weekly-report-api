const submitReport = (req, res, db) => {
  const {
    employeeId,
    leaderEmployeeId,
    userCompanyName,
    primeContractorName,
    onsiteAddress,
    fixedTime,
    salesEmployeeId,
    periodStartDate,
    periodEndDate,
    sourceOfSalesInfo,
    howToCollectSalesInfo,
    salesInfo,
    averageOverTime,
    workContent,
    minimumWorkTime,
    reachability,
    progress,
    physicalCondition,
    relationship,
    failurePointedOut,
    impression,
    difficultyLevel,
    senseOfSchedule,
    situationOfOtherEmployees,
  } = req.body;
  db('weekly_report')
    .insert({
      emp_id: employeeId,
      leader_emp_id: leaderEmployeeId,
      user_company_name: userCompanyName,
      prime_contractor_name: primeContractorName,
      onsite_address: onsiteAddress,
      fixed_time: fixedTime,
      sales_emp_id: salesEmployeeId,
      period_start_date: periodStartDate,
      period_end_date: periodEndDate,
      source_of_sales_info: sourceOfSalesInfo,
      how_to_collect_sales_info: howToCollectSalesInfo,
      sales_info: salesInfo,
      avg_overtime: averageOverTime,
      work_content: workContent,
      minimun_work_time: minimumWorkTime,
      reachability: reachability,
      progress: progress,
      physical_condition: physicalCondition,
      relationship: relationship,
      failure_pointed_out: failurePointedOut,
      impression: impression,
      difficulty_level: difficultyLevel,
      sence_of_schedule: senseOfSchedule,
      situation_of_other_employees: situationOfOtherEmployees,
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

const editReport = (req, res, db) => {
  const { reportId } = req.query;
  const {
    employeeId,
    leaderEmployeeId,
    userCompanyName,
    primeContractorName,
    onsiteAddress,
    fixedTime,
    salesEmployeeId,
    periodStartDate,
    periodEndDate,
    sourceOfSalesInfo,
    howToCollectSalesInfo,
    salesInfo,
    averageOverTime,
    workContent,
    minimumWorkTime,
    reachability,
    progress,
    physicalCondition,
    relationship,
    failurePointedOut,
    impression,
    difficultyLevel,
    senseOfSchedule,
    situationOfOtherEmployees,
  } = req.body;
  db('weekly_report')
    .where({ reportId })
    .update({
      emp_id: employeeId,
      leader_emp_id: leaderEmployeeId,
      user_company_name: userCompanyName,
      prime_contractor_name: primeContractorName,
      onsite_address: onsiteAddress,
      fixed_time: fixedTime,
      sales_emp_id: salesEmployeeId,
      period_start_date: periodStartDate,
      period_end_date: periodEndDate,
      source_of_sales_info: sourceOfSalesInfo,
      how_to_collect_sales_info: howToCollectSalesInfo,
      sales_info: salesInfo,
      avg_overtime: averageOverTime,
      work_content: workContent,
      minimun_work_time: minimumWorkTime,
      reachability: reachability,
      progress: progress,
      physical_condition: physicalCondition,
      relationship: relationship,
      failure_pointed_out: failurePointedOut,
      impression: impression,
      difficulty_level: difficultyLevel,
      sence_of_schedule: senseOfSchedule,
      situation_of_other_employees: situationOfOtherEmployees,
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

const getLatestReport = (req, res, db) => {
  const { employeeId } = req.query;
  db.select(
    'emp_id',
    'user_company_name',
    'prime_contractor_name',
    'onsite_address',
    'fixed_time',
    'leader_emp_id',
    'sales_emp_id',
    'source_of_sales_info',
    'how_to_collect_sales_info',
    'sales_info',
    'avg_overtime',
    'minimun_work_time',
    'reachability',
    'work_content',
    'progress',
    'physical_condition',
    'relationship',
    'difficulty_level',
    'sence_of_schedule',
    'impression',
    'situation_of_other_employees',
    'failure_pointed_out'
  )
    .from('weekly_report')
    .where('emp_id', '=', employeeId)
    .orderByRaw('weekly_report_id::integer desc')
    .limit(1)
    .then((items) => {
      if (items.length) {
        res.json(items[0]);
      } else {
        res.json({ dataExists: 'false' });
      }
    })
    .catch((err) =>
      res.status(400).json({
        dbError: 'error',
      })
    );
};

module.exports = {
  submitReport,
  getLatestReport,
  editReport,
};
