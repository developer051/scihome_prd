#!/usr/bin/env node

/**
 * สคริปต์สำหรับหยุด process ที่ใช้พอร์ต 3007
 * ใช้เมื่อต้องการรัน npm run dev แต่พอร์ตถูกใช้งานอยู่แล้ว
 */

const { execSync } = require('child_process');

const PORT = 3007;

function killProcessOnPort(port) {
  try {
    // ใช้ lsof เพื่อหา process ที่ใช้พอร์ต
    const command = `lsof -ti :${port}`;
    const pids = execSync(command, { encoding: 'utf-8' }).trim();
    
    if (!pids) {
      console.log(`✅ ไม่พบ process ที่ใช้พอร์ต ${port}`);
      return true;
    }

    const pidArray = pids.split('\n').filter(pid => pid.trim());
    
    console.log(`🔍 พบ process ที่ใช้พอร์ต ${port}: ${pidArray.join(', ')}`);
    
    pidArray.forEach(pid => {
      try {
        execSync(`kill ${pid}`, { stdio: 'inherit' });
        console.log(`✅ หยุด process ${pid} เรียบร้อย`);
      } catch (error) {
        console.error(`❌ ไม่สามารถหยุด process ${pid}: ${error.message}`);
      }
    });

    // รอสักครู่ให้ process หยุดทำงาน
    setTimeout(() => {
      console.log(`✅ พอร์ต ${port} พร้อมใช้งานแล้ว`);
    }, 1000);

    return true;
  } catch (error) {
    // ถ้า lsof ไม่พบ process (exit code != 0) แสดงว่าไม่มี process ใช้พอร์ต
    if (error.status === 1) {
      console.log(`✅ ไม่พบ process ที่ใช้พอร์ต ${port}`);
      return true;
    }
    console.error(`❌ เกิดข้อผิดพลาด: ${error.message}`);
    return false;
  }
}

// รันสคริปต์
if (require.main === module) {
  killProcessOnPort(PORT);
}

module.exports = { killProcessOnPort };





