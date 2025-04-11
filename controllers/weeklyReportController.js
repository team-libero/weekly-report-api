const getData = async (req, res, db) => {
  const { employeeId, pageNo, dataAmount } = req.query;
  console.log("Employee ID:", employeeId);

  try {
    await db.transaction(async (trx) => {
      const result1 = await trx
        .select(
          'CONCAT("em1.EMP_LNAME", " ", "em1.EMP_FNAME") as name',
          'CONCAT("em2.EMP_LNAME", " ", "em2.EMP_FNAME") as teamLdName',
          "wr1.USER_COMPANY_NAME as userCompany",
          "wr1.PRIME_CONTRACTOR_NAME as primeContractor",
          "wr1.ONSITE_ADDRESS as address",
          "wr1.FIXED_TIME as regularTime",
          'CONCAT("em3.EMP_LNAME", " ", "em3.EMP_FNAME") as salesEmployee'
        )
        .from("weekly_report as wr1")
        .innerJoin("employee_mst as em1", "wr1.EMP_ID", "em1.EMP_ID")
        .innerJoin("employee_mst as em2", "wr1.LEADER_EMP_ID", "em2.EMP_ID")
        .innerJoin("employee_mst as em3", "wr1.SALES_EMP_ID", "em3.EMP_ID")
        .where(
          { "wr1.EMP_ID": employeeId },
          trx("weekly_report as wr2")
            .max("wr2.WEEKLY_REPORT_ID")
            .where({ "wr2.EMP_ID": employeeId })
        );
      res.json({ result1 });

      //   const result2 = await trx
      //     .select("*")
      //     .from("weekly_report")
      //     .where({ some_column: some_value });

      //   if (result1.length || result2.length) {
      //     res.json({ result1, result2 });
      //   } else {
      //     res.json({ dataExists: "false" });
      //   }
    });
  } catch (error) {
    //  await trx.query("ROLLBACK"); // エラーが発生した場合、トランザクションをロールバック
    console.error(error);
    res.status(400).send("Server Error");
  }
};

module.exports = {
  getData,
};
