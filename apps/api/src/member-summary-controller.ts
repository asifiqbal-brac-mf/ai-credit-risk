import { Controller, Get, Headers, Param, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? 'postgres://geocredit:geocredit@127.0.0.1:55432/geocredit' });
@Controller('api/v1/customers')
export class MemberSummaryController {
 @Get(':id/summary') async summary(@Headers('authorization') authorization:string|undefined,@Param('id') id:string){
  const token=authorization?.replace(/^Bearer\s+/i,''); if(!token||process.env.APP_ENV==='production') throw new UnauthorizedException();
  const userId=Buffer.from(token,'base64url').toString('utf8'); const user=await pool.query('SELECT active FROM users WHERE id=$1',[userId]); if(!user.rowCount||!user.rows[0].active) throw new UnauthorizedException();
  const customer=await pool.query('SELECT id,customer_ref AS "memberId",display_name AS "memberName",member_status AS "memberStatus",vo_code AS "voCode",erp_member_id AS "erpMemberId",date_of_birth AS "dateOfBirth",image_url AS "imageUrl" FROM customers WHERE id=$1',[id]); if(!customer.rowCount) throw new NotFoundException();
  const loans=await pool.query('SELECT loan_ref AS "loanNo",status,product_name AS "loanProduct",started_on AS "disbursementDate",principal AS "disbursedAmount",installment_amount AS "installmentAmount",realized_amount AS "realizedAmount",loan_due AS "loanDue",overdue,outstanding AS "principalOutstanding",schedule_miss_count AS "scheduleMissCount",partial_payment_count AS "partialPaymentCount" FROM loans WHERE customer_id=$1 ORDER BY started_on DESC',[id]);
  const savings=await pool.query('SELECT account_no AS "accountNo",status,product AS "savingsProduct",account_type AS "accountType",installment_amount AS "installmentAmount",principal_amount AS "principalAmount",balance FROM savings_accounts WHERE customer_id=$1 ORDER BY account_no',[id]);
  return {data:{...customer.rows[0],loans:loans.rows,savingsAccounts:savings.rows}};
 }
}
