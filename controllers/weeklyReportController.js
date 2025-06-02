/**
 * 週報基本情報取得.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} db
 */
const getData = async (req, res, db) => {
  const { employeeId } = req.query;

  try {
    await db.transaction(async (trx) => {
      const result = await trx
        .select(
          trx.raw("CONCAT(em1.emp_lname, ' ', em1.emp_fname) as name"),
          trx.raw("CONCAT(em2.emp_lname, ' ', em2.emp_fname) as teamLdName"),
          "wr1.user_company_name as userCompany",
          "wr1.prime_contractor_name as primeContractor",
          "wr1.onsite_address as address",
          "wr1.fixed_time as regularTime",
          trx.raw("CONCAT(em3.emp_lname, ' ', em3.emp_fname) as salesEmployee")
        )
        .from("weekly_report as wr1")
        .innerJoin("employee_mst as em1", "wr1.emp_id", "em1.emp_id")
        .innerJoin("employee_mst as em2", "wr1.leader_emp_id", "em2.emp_id")
        .innerJoin("employee_mst as em3", "wr1.sales_emp_id", "em3.emp_id")
        .where("wr1.emp_id", employeeId)
        .whereIn(
          "wr1.weekly_report_id",
          trx("weekly_report as wr2")
            .select(trx.raw("MAX(wr2.weekly_report_id)"))
            .where({ "wr2.emp_id": employeeId })
        );
      res.json({ result });
    });
  } catch (error) {
    //  await trx.query("ROLLBACK"); // エラーが発生した場合、トランザクションをロールバック
    console.error(error);
    res.status(400).send("Server Error");
  }
};

/**
 * 週報一覧取得.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} db
 */
const getWeeklyReportList = async (req, res, db) => {
  const { employeeId, pageNo } = req.query;

  try {
    await db.transaction(async (trx) => {
      const result = await trx
        .select(
          "weekly_report_id as reportId",
          trx.raw(
            "TO_CHAR(period_start_date, 'YYYYMMDD') || '～' || TO_CHAR(period_end_date, 'YYYYMMDD') as reportPeriod"
          )
        )
        .from("weekly_report")
        .where("emp_id", employeeId)
        .orderBy("period_start_date", "desc")
        // TODO 件数取得絞る
        // .limit(10)
        // .offset((pageNo - 1) * 10); // ページ番号を使ってOFFSETを計算

      res.json({ result });
    });
  } catch (error) {
    //  await trx.query("ROLLBACK"); // エラーが発生した場合、トランザクションをロールバック
    console.error(error);
    res.status(400).send("Server Error");
  }
};

module.exports = {
  getData,
  getWeeklyReportList
};
