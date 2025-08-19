/** 週報基本情報取得API */
const getBaseData = async (req, res, db) => {
  const { employeeId } = req.query;

  try {
    await db.transaction(async (trx) => {
      const result = await trx
        .select(
          trx.raw("CONCAT(em1.emp_lname, ' ', em1.emp_fname) as name"),
          trx.raw("CONCAT(em2.emp_lname, ' ', em2.emp_fname) as teamLdName"),
          'wr1.user_company_name as userCompany',
          'wr1.prime_contractor_name as primeContractor',
          'wr1.onsite_address as address',
          'wr1.fixed_time as regularTime',
          trx.raw("CONCAT(em3.emp_lname, ' ', em3.emp_fname) as salesEmployee")
        )
        .from('weekly_report as wr1')
        .innerJoin('employee_mst as em1', 'wr1.emp_id', 'em1.emp_id')
        .innerJoin('employee_mst as em2', 'wr1.leader_emp_id', 'em2.emp_id')
        .innerJoin('employee_mst as em3', 'wr1.sales_emp_id', 'em3.emp_id')
        .where('wr1.emp_id', employeeId)
        .whereIn(
          'wr1.weekly_report_id',
          trx('weekly_report as wr2')
            .select(trx.raw('MAX(wr2.weekly_report_id)'))
            .where({ 'wr2.emp_id': employeeId })
        );
      const countResult = await trx('weekly_report')
        .count('* as total')
        .where('emp_id', employeeId);

        res.json({ result, countResult });
    });
  } catch (error) {
    console.error(error);
    res.status(400).send('Server Error');
  }
};

/** 週報一覧取得API */
const getWeeklyReportList = async (req, res, db) => {
  const { employeeId, pageNo, dataAmount } = req.query;

  try {
    await db.transaction(async (trx) => {
      const reportList = await trx
        .select(
          'weekly_report_id as reportId',
          trx.raw(
            "TO_CHAR(period_start_date, 'YYYYMMDD') || '～' || TO_CHAR(period_end_date, 'YYYYMMDD') as reportPeriod"
          )
        )
        .from('weekly_report')
        .where('emp_id', employeeId)
        .orderBy('period_start_date', 'desc')
        .limit(dataAmount)
        .offset((pageNo - 1) * dataAmount); // ページ番号を使ってOFFSETを計算
      res.json({ reportList });
    });
  } catch (error) {
    console.error(error);
    res.status(400).send('Server Error');
  }
};

/** 週報詳細情報取得API */
const getDetailData = (req, res, db) => {
  db.select(
    'weekly_report.emp_id as emp_id',
    'emp_info.emp_lname as emp_lname',
    'emp_info.emp_fname as emp_fname',
    'leader_emp_info.emp_id as leader_emp_id',
    'leader_emp_info.emp_lname as leader_emp_lname',
    'leader_emp_info.emp_fname as leader_emp_fname',
    'user_company_name',
    'sales_emp_info.emp_id as sales_emp_id',
    'sales_emp_info.emp_lname as sales_emp_lname',
    'sales_emp_info.emp_fname as sales_emp_fname',
    'prime_contractor_name',
    'onsite_address',
    'fixed_time',
    db.raw(
      'to_char("period_start_date", \'YYYY-MM-DD\') as "period_start_date"'
    ),
    db.raw('to_char("period_end_date", \'YYYY-MM-DD\') as "period_end_date"'),
    'source_of_sales_info',
    'how_to_collect_sales_info',
    'sales_info',
    'avg_overtime',
    'work_content',
    'minimun_work_time',
    'reachability',
    'progress',
    'physical_condition',
    'relationship',
    'failure_pointed_out',
    'impression',
    'difficulty_level',
    'sence_of_schedule',
    'situation_of_other_employees'
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

/* 週報コピー情報取得API */
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

/* 週報情報登録API */
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

/* 週報情報更新API */
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
    .where({ weekly_report_id: reportId })
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

module.exports = {
  getBaseData,
  getWeeklyReportList,
  getDetailData,
  getLatestReport,
  submitReport,
  editReport,
};
