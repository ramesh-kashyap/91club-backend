import connection from "../config/connectDB";
import jwt from 'jsonwebtoken'
import md5 from "md5";
require('dotenv').config();
const axios = require('axios');

let timeNow = Date.now();

const adminPage = async(req, res) => {
    return res.render("manage/index.ejs"); 
}

const adminPage3 = async(req, res) => {
    return res.render("manage/a-index-bet/index3.ejs"); 
}

const adminPage5 = async(req, res) => {
    return res.render("manage/a-index-bet/index5.ejs"); 
}

const adminPage10 = async(req, res) => {
    return res.render("manage/a-index-bet/index10.ejs"); 
}

const adminPage5d = async(req, res) => {
    return res.render("manage/5d.ejs"); 
}

const adminPageK3 = async(req, res) => {
    return res.render("manage/k3.ejs"); 
}

const ctvProfilePage = async(req, res) => {
    var phone = req.params.phone;
    return res.render("manage/profileCTV.ejs", {phone}); 
}

const giftPage = async(req, res) => {
    return res.render("manage/giftPage.ejs"); 
}

const salaryPage = async(req, res) => {
    return res.render("manage/salaryPage.ejs"); 
}

const membersPage = async(req, res) => {
    return res.render("manage/members.ejs"); 
}

const ctvPage = async(req, res) => {
    return res.render("manage/ctv.ejs"); 
}

const dailybonusrecord = async(req, res) => {
    return res.render("manage/dailyBonus.ejs"); 
}
const aibonusrecord = async(req, res) => {
    return res.render("manage/listaiBonus.ejs"); 
}
const incomebonusrecord = async(req, res) => {
    return res.render("manage/incomerecordbonus.ejs"); 
}

const Streakbonusrecord = async(req, res) => {
    return res.render("manage/streakrecord.ejs"); 
}
const infoMember = async(req, res) => {
    let phone = req.params.id;
    return res.render("manage/profileMember.ejs", {phone}); 
}


const statistical = async(req, res) => {
    return res.render("manage/statistical.ejs"); 
}

const rechargePage = async(req, res) => {
    return res.render("manage/recharge.ejs"); 
}

const rechargemanual = async(req, res) => {
    return res.render("manage/rechargemanual.ejs"); 
}
const rechargeRecord = async(req, res) => {
    return res.render("manage/rechargeRecord.ejs"); 
}

const withdraw = async(req, res) => {
    return res.render("manage/withdraw.ejs"); 
}

const withdrawCrytp = async(req, res) => {
    return res.render("manage/withdrawCrytp.ejs"); 
}


const withdrawRecord = async(req, res) => {
    return res.render("manage/withdrawRecord.ejs"); 
}
const settings = async(req, res) => {
    return res.render("manage/settings.ejs"); 
}


// xác nhận admin
const middlewareAdminController = async(req, res, next) => {
    // xác nhận token
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    if (!auth) {
        return res.redirect("/login");
    }
    const [rows] = await connection.execute('SELECT `token`,`level`,`role`, `status` FROM `users` WHERE `token` = ? AND veri = 1', [auth]);
    if (!rows) {
        return res.redirect("/login");
    }
    try {
        if (auth == rows[0].token && rows[0].status == 1) {
            if (rows[0].role == 1 || rows[0].role == 2) {
                next();
            } else {
                return res.redirect("/home");
            }
        } else {
            return res.redirect("/login");
        }
    } catch (error) {
        return res.redirect("/login");
    }
}

const middlewareMainAdminController = async (req, res, next) => {
    // Confirm token
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    if (!auth) {
        return res.redirect("/login");
    }
    const [rows] = await connection.execute('SELECT `token`,`level`,`role`, `status` FROM `users` WHERE `token` = ? AND veri = 1', [auth]);
    if (!rows || rows.length === 0) {
        return res.redirect("/login");
    }
    try {
        if (auth === rows[0].token && rows[0].status === 1) {
            if (rows[0].role === 1) {
                next();
            } else {
                // Return JSON response if not admin
                const timeNow = new Date().toISOString();
                return res.status(200).json({
                    message: 'Failed as you are not Admin',
                    status: false,
                    timeStamp: timeNow,
                });
            }
        } else {
            return res.redirect("/login");
        }
    } catch (error) {
        return res.redirect("/login");
    }
}


const totalJoin = async(req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    let typeid = req.body.typeid;
    if (!typeid) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let game = '';
    if(typeid == '1') game = 'wingo';
    if(typeid == '2') game = 'wingo3';
    if(typeid == '3') game = 'wingo5';
    if(typeid == '4') game = 'wingo10';
    
    const [rows] = await connection.query('SELECT * FROM users WHERE `token` = ? ', [auth]);

    if (rows.length > 0) {
        const [wingoall] = await connection.query(`SELECT * FROM minutes_1 WHERE game = "${game}" AND status = 0 AND level = 0 ORDER BY id ASC `, [auth]);
        const [winGo1] = await connection.execute(`SELECT * FROM wingo WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `, []);
        const [winGo10] = await connection.execute(`SELECT * FROM wingo WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 10 `, []);
        const [setting] = await connection.execute(`SELECT * FROM admin `, []);

        return res.status(200).json({
            message: 'Success',
            status: true,
            datas: wingoall,
            lotterys: winGo1,
            list_orders: winGo10,
            setting: setting,
            timeStamp: timeNow,
        });
    } else {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
}

const listMember = async(req, res) => {
    let {pageno, limit } = req.body;

    if (!pageno || !limit) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (pageno < 0 || limit < 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }
    const [users] = await connection.query(`SELECT * FROM users WHERE veri = 1 AND level != 2 ORDER BY id DESC LIMIT ${pageno}, ${limit} `);
    const [total_users] = await connection.query(`SELECT * FROM users WHERE veri = 1 AND level != 2`);
    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: users,
        page_total: Math.ceil(total_users.length / limit)
    });
}

const listCTV = async(req, res) => {
    let {pageno, pageto } = req.body;

    if (!pageno || !pageto) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (pageno < 0 || pageto < 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }
    const [wingo] = await connection.query(`SELECT * FROM users WHERE veri = 1 AND level = 2 ORDER BY id DESC LIMIT ${pageno}, ${pageto} `);
    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: wingo,
    });
}

function formateT2(params) {
    let result = (params < 10) ? "0" + params : params;
    return result;
}

function timerJoin2(params = '') {
    let date = '';
    if (params) {
      date = new Date(Number(params));
    } else {
      date = Date.now();
      date = new Date(Number(date));
    }
    let years = formateT2(date.getFullYear());
    let months = formateT2(date.getMonth() + 1);
    let days = formateT2(date.getDate());
    
    return years + "-" + months + "-" + days;
}

const statistical2 = async(req, res) => {
    const [wingo] = await connection.query(`SELECT SUM(money) as total FROM minutes_1 WHERE status = 1 `);
    const [wingo2] = await connection.query(`SELECT SUM(money) as total FROM minutes_1 WHERE status = 2 `);
    const [users] = await connection.query(`SELECT COUNT(id) as total FROM users WHERE status = 1 `);
    const [users2] = await connection.query(`SELECT COUNT(id) as total FROM users WHERE status = 0 `);
    const [recharge] = await connection.query(`SELECT SUM(money) as total FROM recharge WHERE status = 1 `);
    const [withdraw] = await connection.query(`SELECT SUM(money) as total FROM withdraw WHERE status = 1 `);

    const [recharge_today] = await connection.query(`SELECT SUM(money) as total FROM recharge WHERE status = 1 AND today = ?`, [timerJoin2()]);
    const [withdraw_today] = await connection.query(`SELECT SUM(money) as total FROM withdraw WHERE status = 1 AND today = ?`, [timerJoin2()]);

    let win = wingo[0].total;
    let loss = wingo2[0].total;
    let usersOnline = users[0].total;
    let usersOffline = users2[0].total;
    let recharges = recharge[0].total;
    let withdraws = withdraw[0].total;
    return res.status(200).json({
        message: 'Success',
        status: true,
        win: win,
        loss: loss,
        usersOnline: usersOnline,
        usersOffline: usersOffline,
        recharges: recharges,
        withdraws: withdraws,
        rechargeToday: recharge_today[0].total,
        withdrawToday: withdraw_today[0].total,
    });
}

const changeAdmin = async(req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    let value = req.body.value;
    let type = req.body.type;
    let typeid = req.body.typeid;

    if(!value || !type ||!typeid) return res.status(200).json({
        message: 'Failed',
        status: false,
        timeStamp: timeNow,
    });;
    let game = '';
    let bs = '';
    if(typeid == '1') {
        game = 'wingo1';
        bs = 'bs1';
    }
    if(typeid == '2') {
        game = 'wingo3';
        bs = 'bs3';
    }
    if(typeid == '3') {
        game = 'wingo5';
        bs = 'bs5';
    }
    if(typeid == '4') {
        game = 'wingo10';
        bs = 'bs10';
    }
    switch (type) {
        case 'change-wingo1':
            await connection.query(`UPDATE admin SET ${game} = ? `, [value]);
            return res.status(200).json({
                message: 'Editing results successfully',
                status: true,
                timeStamp: timeNow,
            });
            break;
        case 'change-win_rate': 
            await connection.query(`UPDATE admin SET ${bs} = ? `, [value]);
            return res.status(200).json({
                message: 'Editing win rate successfully',
                status: true,
                timeStamp: timeNow,
            });
            break;
    
        default:
            return res.status(200).json({
                message: 'Failed',
                status: false,
                timeStamp: timeNow,
            });
            break;
    }

}

function formateT(params) {
    let result = (params < 10) ? "0" + params : params;
    return result;
}

function timerJoin(params = '') {
    let date = '';
    if (params) {
      date = new Date(Number(params));
    } else {
      date = Date.now();
      date = new Date(Number(date));
    }
    let years = formateT(date.getFullYear());
    let months = formateT(date.getMonth() + 1);
    let days = formateT(date.getDate());
    let weeks = formateT(date.getDay());
  
    let hours = formateT(date.getHours());
    let minutes = formateT(date.getMinutes());
    let seconds = formateT(date.getSeconds());
    // return years + '-' + months + '-' + days + ' ' + hours + '-' + minutes + '-' + seconds;
    return years + " - " + months + " - " + days;
  }


  const userInfo = async (req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    let phone = req.body.phone;
    const timeNow = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (!phone) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    try {
        const [user] = await connection.query('SELECT * FROM users WHERE phone = ?', [phone]);

        if (user.length === 0) {
            return res.status(200).json({
                message: 'Failed',
                status: false,
                timeStamp: timeNow,
            });
        }
        let userInfo = user[0];
        const userId = userInfo.id;

        // Function to calculate commission for a specific level
        const calculateCommission = async (userId, level) => {
            const [commissionResult] = await connection.query(
                'SELECT SUM(`comm`) as total_comm FROM incomes WHERE `user_id` = ? AND `remarks` = ? AND `bet` = ?',
                [userId, 'Team Comission Bonus', level]
            );
            return commissionResult[0].total_comm || 0;
        };

        // Function to get subordinates for a specific level
        const getSubordinates = async (codes) => {
            if (codes.length === 0) {
                return [];
            }
            const [subordinates] = await connection.query('SELECT `id`, `phone`, `code`, `invite`, `time` FROM users WHERE `invite` IN (?)', [codes]);
            return subordinates;
        };

        // Initialize counts and sums for each level
        let f1 = 0, f2 = 0, f3 = 0, f4 = 0, f5 = 0, f6 = 0;
        let f1_comm = 0, f2_comm = 0, f3_comm = 0, f4_comm = 0, f5_comm = 0, f6_comm = 0;
        let f1_recharge = 0, f2_recharge = 0, f3_recharge = 0, f4_recharge = 0, f5_recharge = 0, f6_recharge = 0;

        // Get direct subordinates (level 1)
        const [f1s] = await connection.query('SELECT `id`, `phone`, `code`, `invite`, `time` FROM users WHERE `invite` = ?', [userInfo.code]);
        f1 = f1s.length;
        f1_comm = await calculateCommission(userId, 1);

        // Function to calculate total recharge for a specific level
        const calculateRecharge = async (phones, date) => {
            if (phones.length === 0) {
                return 0;
            }
            const [rechargeResult] = await connection.query(
                'SELECT SUM(`money`) as total_recharge FROM recharge WHERE phone IN (?) AND status = 1 AND DATE(`today`) = ?',
                [phones, date]
            );
            return rechargeResult[0].total_recharge || 0;
        };

        const currentDate = new Date().toISOString().slice(0, 10); // format 'YYYY-MM-DD'

        f1_recharge = await calculateRecharge(f1s.map(sub => sub.phone), currentDate);

        // Get subordinates for levels 2-6 and calculate commissions and recharges
        let currentLevelCodes = f1s.map(sub => sub.code);
        for (let level = 2; level <= 6; level++) {
            let nextLevelSubordinates = await getSubordinates(currentLevelCodes);
            let nextLevelPhones = nextLevelSubordinates.map(sub => sub.phone);
            let nextLevelCodes = nextLevelSubordinates.map(sub => sub.code);

            if (level === 2) {
                f2 = nextLevelSubordinates.length;
                f2_comm = await calculateCommission(userId, 2);
                f2_recharge = await calculateRecharge(nextLevelPhones, currentDate);
            } else if (level === 3) {
                f3 = nextLevelSubordinates.length;
                f3_comm = await calculateCommission(userId, 3);
                f3_recharge = await calculateRecharge(nextLevelPhones, currentDate);
            } else if (level === 4) {
                f4 = nextLevelSubordinates.length;
                f4_comm = await calculateCommission(userId, 4);
                f4_recharge = await calculateRecharge(nextLevelPhones, currentDate);
            } else if (level === 5) {
                f5 = nextLevelSubordinates.length;
                f5_comm = await calculateCommission(userId, 5);
                f5_recharge = await calculateRecharge(nextLevelPhones, currentDate);
            } else if (level === 6) {
                f6 = nextLevelSubordinates.length;
                f6_comm = await calculateCommission(userId, 6);
                f6_recharge = await calculateRecharge(nextLevelPhones, currentDate);
            }

            currentLevelCodes = nextLevelCodes;
            if (currentLevelCodes.length === 0) break; // No more subordinates to process
        }


        const [recharge] = await connection.query(
            'SELECT SUM(`money`) as total FROM recharge WHERE phone = ? AND status = 1 ',
            [phone, currentDate]
        );


        const [withdraw] = await connection.query(
            'SELECT SUM(`money`) as total FROM withdraw WHERE phone = ? AND status = 1 ',
            [phone, currentDate]
        );
        const [bank_user] = await connection.query('SELECT * FROM user_bank WHERE phone = ?', [phone]);
        const [telegram_ctv] = await connection.query('SELECT `telegram` FROM point_list WHERE phone = ?', [userInfo.ctv]);
        const [ng_moi] = await connection.query('SELECT `id_user` FROM users WHERE code = ?', [userInfo.invite]);

        return res.status(200).json({
            message: 'Success',
            status: true,
            datas: user,
            total_r: recharge[0].total,
            total_w: withdraw[0].total,
            f1: f1,
            f2: f2,
            f3: f3,
            f4: f4,
            f5: f5,
            f6: f6,
            f1_comm: f1_comm,
            f2_comm: f2_comm,
            f3_comm: f3_comm,
            f4_comm: f4_comm,
            f5_comm: f5_comm,
            f6_comm: f6_comm,
            f1_recharge: f1_recharge,
            f2_recharge: f2_recharge,
            f3_recharge: f3_recharge,
            f4_recharge: f4_recharge,
            f5_recharge: f5_recharge,
            f6_recharge: f6_recharge,
            bank_user: bank_user,
            telegram: telegram_ctv[0] ? telegram_ctv[0].telegram : null,
            ng_moi: ng_moi[0] ? ng_moi[0].id_user : null,
            daily: userInfo.ctv,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal Server Error',
            status: false,
            timeStamp: timeNow,
        });
    }
};




const recharge = async (req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    if (!auth) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: new Date().toISOString(),
        });
    }

    // Get the id_user and phone based on auth token
    const [auths] = await connection.query('SELECT id_user, phone FROM users WHERE token = ?', [auth]);
    if (auths.length === 0) {
        return res.status(404).json({
            message: 'User not found',
            status: false,
            timeStamp: new Date().toISOString(),
        });
    }

    let phone = auths[0].phone;

    const [recharge] = await connection.query(`
        SELECT recharge.*, users.id_user 
        FROM recharge 
        LEFT JOIN users ON recharge.phone = users.phone 
        WHERE recharge.status = 0 AND recharge.type != "Manual" 
        ORDER BY recharge.today DESC`
    );
    const [rechargeManual] = await connection.query(`
        SELECT recharge.*, users.id_user 
        FROM recharge 
        LEFT JOIN users ON recharge.phone = users.phone 
        WHERE recharge.status = 0 AND recharge.type = "Manual" 
        ORDER BY recharge.today DESC`
    );
    const [recharge2] = await connection.query(`
        SELECT recharge.*, users.id_user 
        FROM recharge 
        LEFT JOIN users ON recharge.phone = users.phone 
        WHERE recharge.status != 0 
        ORDER BY recharge.today DESC`
    );
    const [withdraw] = await connection.query(`
        SELECT withdraw.*, users.id_user 
        FROM withdraw 
        LEFT JOIN users ON withdraw.phone = users.phone 
        WHERE withdraw.status = 0 
        ORDER BY withdraw.today DESC`
    );
    const [withdraw2] = await connection.query(`
        SELECT withdraw.*, users.id_user 
        FROM withdraw 
        LEFT JOIN users ON withdraw.phone = users.phone 
        WHERE withdraw.status != 0 
        ORDER BY withdraw.today DESC`
    );
    const [withdrawCrypto] = await connection.query(`
        SELECT withdraw.*, users.id_user 
        FROM withdraw 
        LEFT JOIN users ON withdraw.phone = users.phone 
        WHERE withdraw.status = 0 AND withdraw.walletType != "INR" 
        ORDER BY withdraw.today DESC`
    );

    return res.status(200).json({
        message: 'Success',
        status: true,
        datas1: rechargeManual,
        datas: recharge,
        datas2: recharge2,
        datas3: withdraw,
        datas4: withdraw2,
        withdrawCrypto: withdrawCrypto,
    });
};


const settingGet = async(req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    if (!auth) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [bank_recharge] = await connection.query('SELECT * FROM bank_recharge ');
    const [settings] = await connection.query('SELECT * FROM admin ');
    return res.status(200).json({
        message: 'Success',
        status: true,
        settings: settings,
        datas: bank_recharge,
    });
}

const rechargeDuyet = async (req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    let id = req.body.id;
    let type = req.body.type;

    if (!auth || !id || !type) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: new Date().toISOString(),
        });
    }

    try {
        if (type === 'confirm') {
            await connection.query('UPDATE recharge SET status = 1 WHERE id = ?', [id]);
            const [info] = await connection.query('SELECT * FROM recharge WHERE id = ?', [id]);
            const rechargeInfo = info[0];

            // Update user's money
            await connection.query('UPDATE users SET money = money + ?, total_money = total_money + ?,able_to_bet = able_to_bet + ? WHERE phone = ?', 
                [rechargeInfo.money, rechargeInfo.money,rechargeInfo.money, rechargeInfo.phone]);

            // Check if this is the first recharge for this phone
            const [rowCount] = await connection.query('SELECT COUNT(*) as count FROM recharge WHERE phone = ? AND status = ?', 
                [rechargeInfo.phone, 1]);
            if (rowCount[0].count === 1) {
                await directBonus(rechargeInfo.money, rechargeInfo.phone);
                await firstRechargeBonus(rechargeInfo.money, rechargeInfo.phone);
            }

        

            // Calculate the sum of recharges for the current day where status is 1
            const checkTime = new Date().toISOString().slice(0, 10);
            console.log(checkTime);
            const [sumResult] = await connection.query(
                'SELECT SUM(money) as sumOfRecharge FROM recharge WHERE phone = ? AND status = 1 AND DATE(today) = ?',
                [rechargeInfo.phone, checkTime]
            );

            let sumOfRecharge = sumResult[0].sumOfRecharge || 0;
            if (sumOfRecharge >= 500) {
                await rechargeBonus(rechargeInfo.phone, sumOfRecharge);
            }

            return res.status(200).json({
                message: 'Xác nhận đơn thành công',
                status: true,
                datas: rechargeInfo,
            });
        } else if (type === 'delete') {
            await connection.query('UPDATE recharge SET status = 2 WHERE id = ?', [id]);
            return res.status(200).json({
                message: 'Hủy đơn thành công',
                status: true,
            });
        } else {
            return res.status(400).json({
                message: 'Invalid type',
                status: false,
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal Server Error',
            status: false,
            error: error.message,
        });
    }
};


const firstRechargeBonus = async (money, phone) => {
    try {
        console.log('Starting first Recharge Bonus function');

        // Select the user where phone column matches with phone parameter
        const [userResult] = await connection.query('SELECT `id`, `invite` FROM users WHERE phone = ?', [phone]);
        let user = userResult[0];

        if (!user) {
            console.error('User not found with phone:', phone);
            throw new Error('User not found');
        }
        console.log('User found:', user);

        // Calculate the bonus
        let bonus = 0;
        if (money==100) {
            bonus = 28;
        } else if (money==200) {
            bonus = 40;
        } else if (money==500) {
            bonus = 50;
        }
        else if (money==50000) {
            bonus = 500;
        }
        else if (money==100000) {
            bonus = 1000;
        }
        console.log('Calculated bonus:', bonus);

        if (bonus > 0) {
            // Insert data into incomes table
            const sql = `INSERT INTO incomes (user_id, amount, comm, remarks, rname) VALUES (?, ?, ?, ?, ?)`;
            await connection.execute(sql, [user.id, money, bonus, 'Recharge Activation Bonus', phone]);
            console.log('Inserted bonus into incomes table for sponsor:', user.id);

            // Update the sponsor's money
            const updateSql = 'UPDATE users SET money = money + ?, able_to_bet = able_to_bet + ? WHERE id = ?';
            await connection.execute(updateSql, [bonus,bonus, user.id]);
            console.log('Updated sponsor money:', user.id);
        } else {
            console.log('No bonus applicable for the amount:', money);
        }
    } catch (error) {
        console.error('Error in directBonus function:', error);
        throw error;
    }
};



const rechargeBonus = async (phone, sumOfRecharge) => {
    let bonus = 0;

    if (sumOfRecharge >= 500 && sumOfRecharge < 5000) {
        bonus = 5;
    } else if (sumOfRecharge >= 5000 && sumOfRecharge < 50000) {
        bonus = 50;
    } else if (sumOfRecharge >= 50000 && sumOfRecharge < 100000) {
        bonus = 500;
    } else if (sumOfRecharge >= 100000 && sumOfRecharge < 200000) {
        bonus = 1000;
    } else if (sumOfRecharge >= 200000) {
        bonus = 2000;
    }

    if (bonus > 0) {
        const [userResult] = await connection.query('SELECT `id` FROM users WHERE phone = ?', [phone]);
        let user = userResult[0];

        if (!user) {
            throw new Error('User not found');
        }

        const sql = `INSERT INTO incomes (user_id, amount, comm, remarks, rname) VALUES (?, ?, ?, ?, ?)`;
        await connection.execute(sql, [user.id, sumOfRecharge, bonus, 'Daily Recharge Bonus', phone]);

        // Update the user's money with the bonus
        await connection.query('UPDATE users SET money = money + ? , able_to_bet= able_to_bet + ? ,  WHERE id = ?', [bonus, bonus,user.id]);
    }
};

const directBonus = async (money, phone) => {
    try {
        console.log('Starting directBonus function');

        // Select the user where phone column matches with phone parameter
        const [userResult] = await connection.query('SELECT `id`, `invite` FROM users WHERE phone = ?', [phone]);
        let user = userResult[0];

        if (!user) {
            console.error('User not found with phone:', phone);
            throw new Error('User not found');
        }
        console.log('User found:', user);

        // Get the invite code from the user
        let invite = user.invite;

        // Select the sponsor where code matches the invite code
        const [sponsorResult] = await connection.query('SELECT `id`, `money` FROM users WHERE code = ?', [invite]);
        let sponsor = sponsorResult[0];

        if (!sponsor) {
            console.error('Sponsor not found with invite code:', invite);
            throw new Error('Sponsor not found');
        }
        console.log('Sponsor found:', sponsor);

        // Calculate the bonus
        let bonus = 0;
        if (money >= 1000 && money < 3000) {
            bonus = 50;
        } else if (money >= 5000 && money < 10000) {
            bonus = 200;
        } else if (money >= 10000 && money < 25000) {
            bonus = 400;
        }
        console.log('Calculated bonus:', bonus);

        if (bonus > 0) {
            // Insert data into incomes table
            const sql = `INSERT INTO incomes (user_id, amount, comm, remarks, rname) VALUES (?, ?, ?, ?, ?)`;
            await connection.execute(sql, [sponsor.id, money, bonus, 'Direct Bonus', phone]);
            console.log('Inserted bonus into incomes table for sponsor:', sponsor.id);

            // Update the sponsor's money
            const updateSql = 'UPDATE users SET money = money + ? ,able_to_bet = able_to_bet + ? WHERE id = ?';
            await connection.execute(updateSql, [bonus,bonus, sponsor.id]);
            console.log('Updated sponsor money:', sponsor.id);
        } else {
            console.log('No bonus applicable for the amount:', money);
        }
    } catch (error) {
        console.error('Error in directBonus function:', error);
        throw error;
    }
};


const userBonus = async (money, phone) => {
    try {
        console.log('Starting directBonus function');

        // Select the user where phone column matches with phone parameter
        const [userResult] = await connection.query('SELECT `id`, `invite` FROM users WHERE phone = ?', [phone]);
        let user = userResult[0];

        if (!user) {
            console.error('User not found with phone:', phone);
            throw new Error('User not found');
        }
        console.log('User found:', user);

        // Calculate the bonus
        let bonus = 0;
        if (money >= 1000 && money < 3000) {
            bonus = 50;
        } else if (money >= 5000 && money < 10000) {
            bonus = 200;
        } else if (money >= 10000 && money < 25000) {
            bonus = 400;
        }
        console.log('Calculated bonus:', bonus);

        if (bonus > 0) {
            // Insert data into incomes table
            const sql = `INSERT INTO incomes (user_id, amount, comm, remarks, rname) VALUES (?, ?, ?, ?, ?)`;
            await connection.execute(sql, [user.id, money, bonus, 'Recharge Activation Bonus', phone]);
            console.log('Inserted bonus into incomes table for sponsor:', user.id);

            // Update the sponsor's money
            const updateSql = 'UPDATE users SET money = money + ?,able_to_bet = able_to_bet + ? WHERE id = ?';
            await connection.execute(updateSql, [bonus, bonus,user.id]);
            console.log('Updated sponsor money:', user.id);
        } else {
            console.log('No bonus applicable for the amount:', money);
        }
    } catch (error) {
        console.error('Error in directBonus function:', error);
        throw error;
    }
};


const handlWithdraw = async(req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    let id = req.body.id;
    let type = req.body.type;
    let paymentMode = req.body.paymentMode;
    if (!auth || !id || !type) {
        return res.status(200).json({
            message: 'Failed', 
            status: false,
            timeStamp: timeNow,
        });
    }
    if (type == 'confirm') {



    if (paymentMode=="CRYPTO")
     {

    await connection.query(`UPDATE withdraw SET status = 1 WHERE id = ?`, [id]);
    const [info] = await connection.query(`SELECT * FROM withdraw WHERE id = ?`, [id]);
    return res.status(200).json({
        message: 'Application confirmed successfully',
        status: true,
        datas: info,
    }); 
    
    }
    else
    {


    //  const [info] = await connection.query(`SELECT * FROM withdraw WHERE id = ?`, [id]);
    //   if (info.length != 0) {
    //     const apiUrl = 'https://payin.gamegateway.online/v3/generateToken';
    //     const postData = {
    //         userKey: 'KBS2cce4f7216',
    //         userToken: 'ef6534b8e22e63d31226a5428f9f18df',
    //     };

    //     const headers = {
    //     'Content-Type': 'application/json',
    //     };

    //     axios.post(apiUrl, postData, { headers })
    //     .then(async response => {   
          
    //         if (response.data.status=="FAILED") 
    //         {
    //             return res.status(200).json({
    //                 message: response.data.error,
    //                 status: false,
    //                 timeStamp: timeNow,
    //             })
    //         }

         
    //    let token = response.data.data.token;
    //    let id_order = Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1) ) + 10000000000000;
    //    let vat = Math.floor(Math.random() * (2000 - 0 + 1) ) + 0;
    //    const apiUrl = 'https://payin.gamegateway.online/v3/doPayout';
    //    let netAmt= info[0].money-info[0].money*3/100;
    //    const postData = {
    //        userKey: 'KBS2cce4f7216',
    //        userToken: 'ef6534b8e22e63d31226a5428f9f18df',
    //        genrateToken:token,
    //        orderId:id_order,
    //        accountHolderName:info[0].name_user,
    //        bankName:info[0].name_bank,
    //        accountNumer:info[0].account_number,
    //        ifscCode:info[0].ifsc_code,
    //        mobileNumber:info[0].phone,
    //        email:vat + "@gmail.com",
    //        amount:netAmt,
    //    };

    //    const headers = {
    //    'Content-Type': 'application/json',
    //    };
    //    axios.post(apiUrl, postData, { headers }).then(async response => {
    //        if (response.data.data.status=="FAILED") 
    //        {
    //            return res.status(200).json({
    //                message: response.data.error,
    //                status: false,
    //                timeStamp: timeNow,
    //            })
    //        }
    //        else
    //        {
    //         await connection.query(`UPDATE withdraw SET status = 1 WHERE id = ?`, [id]);
    //         const [info] = await connection.query(`SELECT * FROM withdraw WHERE id = ?`, [id]);
    //         return res.status(200).json({
    //             message: 'Application confirmed successfully',
    //             status: true,
    //             datas: info,
    //         });
    //        }       
    //     })
    //     .catch(error => {
    //         return res.status(200).json({
    //             message: error,
    //             status: false,
    //             timeStamp: timeNow,
    //         })
    //     });

        
    //         })
    //         .catch(error => {
    //             return res.status(200).json({
    //                 message: 'Failed',
    //                 status: false,
    //                 timeStamp: timeNow,
    //             })
    //         });

    //         }

            await connection.query(`UPDATE withdraw SET status = 1 WHERE id = ?`, [id]);
            const [info] = await connection.query(`SELECT * FROM withdraw WHERE id = ?`, [id]);
            return res.status(200).json({
                message: 'Application confirmed successfully',
                status: true,
                datas: info,
            }); 
            





        }

    }
    if (type == 'delete') {
        await connection.query(`UPDATE withdraw SET status = 2 WHERE id = ?`, [id]);
        const [info] = await connection.query(`SELECT * FROM withdraw WHERE id = ?`, [id]);
        await connection.query('UPDATE users SET money = money + ? WHERE phone = ? ', [info[0].money, info[0].phone]);
        return res.status(200).json({
            message: 'Cancellation successful',
            status: true,
            datas: info,
        });
    }
}

const settingBank = async(req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    let name_bank = req.body.name_bank;
    let name = req.body.name;
    let info = req.body.info;
    let typer = req.body.typer;
    if (!auth || !typer) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    if (typer == 'bank') {
        await connection.query(`UPDATE bank_recharge SET name_bank = ?, name_user = ?, stk = ? WHERE type = 'bank'`, [name_bank, name, info]);
        return res.status(200).json({
            message: 'Thay đổi thành công',
            status: true,
            datas: recharge,
        });
    }
    if (typer == 'momo') {
        await connection.query(`UPDATE bank_recharge SET name_bank = ?, name_user = ?, stk = ? WHERE type = 'momo'`, [name_bank, name, info]);
        return res.status(200).json({
            message: 'Thay đổi thành công',
            status: true,
            datas: recharge,
        });
    }
}

const settingCskh = async(req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    let telegram = req.body.telegram;
    let cskh = req.body.cskh;
    let myapp_web = req.body.myapp_web;
    if (!auth || !cskh || !telegram) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    await connection.query(`UPDATE admin SET telegram = ?, cskh = ?, app = ?`, [telegram, cskh, myapp_web]);
    return res.status(200).json({
        message: 'Thay đổi thành công',
        status: true,
    });
}

const banned = async(req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    let id = req.body.id;
    let type = req.body.type;
    if (!auth || !id) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    if (type == 'open') {
        await connection.query(`UPDATE users SET status = 1 WHERE id = ?`, [id]);
    }
    if (type == 'close') {
        await connection.query(`UPDATE users SET status = 2 WHERE id = ?`, [id]);
    }
    return res.status(200).json({
        message: 'Thay đổi thành công',
        status: true,
    });
}


const createBonus = async(req, res) => {
    const randomString = (length) => {
        var result = '';
        var characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }
    function timerJoin(params = '') {
        let date = '';
        if (params) {
          date = new Date(Number(params));
        } else {
          date = Date.now();
          date = new Date(Number(date));
        }
        let years = formateT(date.getFullYear());
        let months = formateT(date.getMonth() + 1);
        let days = formateT(date.getDate());
        let weeks = formateT(date.getDay());
      
        let hours = formateT(date.getHours());
        let minutes = formateT(date.getMinutes());
        let seconds = formateT(date.getSeconds());
        // return years + '-' + months + '-' + days + ' ' + hours + '-' + minutes + '-' + seconds;
        return years + "" + months + "" + days;
    }
    const d = new Date();
    const time = d.getTime();

    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    let money = req.body.money;
    let type = req.body.type;


    if (!money || !auth) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    const [user] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false, 
            timeStamp: timeNow,
        });
    }
    let userInfo = user[0];

    if (type == 'all') {
        let select = req.body.select;
        if (select == '1') {
            await connection.query(`UPDATE point_list SET money = money + ? WHERE level = 2`, [money]);
        } else {
            await connection.query(`UPDATE point_list SET money = money - ? WHERE level = 2`, [money]);
        }
        return res.status(200).json({
            message: 'successful change',
            status: true,
        });
    } 

    if (type == 'two') {
        let select = req.body.select;
        if (select == '1') {
            await connection.query(`UPDATE point_list SET money_us = money_us + ? WHERE level = 2`, [money]);
        } else {
            await connection.query(`UPDATE point_list SET money_us = money_us - ? WHERE level = 2`, [money]);
        }
        return res.status(200).json({
            message: 'successful change',
            status: true,
        });
    } 
  
    if (type == 'one') {
        let select = req.body.select;
        let phone = req.body.phone;
        const [user] = await connection.query('SELECT * FROM point_list WHERE phone = ? ', [phone]);
        if(user.length == 0) {
            return res.status(200).json({
                message: 'Failed',
                status: false, 
                timeStamp: timeNow,
            });
        } 
        if (select == '1') {
            await connection.query(`UPDATE point_list SET money = money + ? WHERE level = 2 and phone = ?`, [money, phone]);
        } else {
            await connection.query(`UPDATE point_list SET money = money - ? WHERE level = 2 and phone = ?`, [money, phone]);
        }
        return res.status(200).json({
            message: 'successful change',
            status: true,
        });
    }

    if (type == 'three') {
        let select = req.body.select;
        let phone = req.body.phone;
        const [user] = await connection.query('SELECT * FROM point_list WHERE phone = ? ', [phone]);
        if(user.length == 0) {
            return res.status(200).json({
                message: 'successful change',
                status: false, 
                timeStamp: timeNow,
            });
        } 
        if (select == '1') {
            await connection.query(`UPDATE point_list SET money_us = money_us + ? WHERE level = 2 and phone = ?`, [money, phone]);
        } else {
            await connection.query(`UPDATE point_list SET money_us = money_us - ? WHERE level = 2 and phone = ?`, [money, phone]);
        }
        return res.status(200).json({
            message: 'successful change',
            status: true,
        });
    }

    if (!type) {
        let id_redenvelops = String(timerJoin()) + randomString(16);
        let sql = `INSERT INTO redenvelopes SET id_redenvelope = ?, phone = ?, money = ?, used = ?, amount = ?, status = ?, time = ?`;
        await connection.query(sql, [id_redenvelops, userInfo.phone, money, 1, 1, 0, time]);
        return res.status(200).json({
            message: 'Successful change',
            status: true,
            id: id_redenvelops,
        });
    }
}

const listRedenvelops = async(req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);

    let [redenvelopes] = await connection.query('SELECT * FROM redenvelopes WHERE status = 0 ');
    return res.status(200).json({
        message: 'Successful change',
        status: true,
        redenvelopes: redenvelopes,
    });
}

const listSalaryBonus = async (req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);

    try {
        // Step 1: Get all redenvelopes
        let [redenvelopes] = await connection.query('SELECT * FROM incomes WHERE remarks="Salary Bonus" ORDER BY created_at DESC');

        // Step 2: For each redenvelope, get the corresponding id_user
        for (let redenvelope of redenvelopes) {
            const [userDetails] = await connection.query('SELECT id_user FROM users WHERE id = ?', [redenvelope.user_id]);
            redenvelope.id_user = userDetails.length ? userDetails[0].id_user : null;
        }

        // Step 3: Send the response
        return res.status(200).json({
            message: 'Successful change',
            status: true,
            redenvelopes: redenvelopes,
        });
    } catch (error) {
        console.error('Error in listSalaryBonus function:', error);
        return res.status(500).json({
            message: 'Internal Server Error',
            status: false,
        });
    }
};



const settingbuff = async(req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    let id_user = req.body.id_user;
    let buff_acc = req.body.buff_acc;
    let money_value = req.body.money_value;
    if (!id_user || !buff_acc || !money_value) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    const [user_id] = await connection.query(`SELECT * FROM users WHERE id_user = ?`, [id_user]);

    if (user_id.length > 0) {
        if (buff_acc == '1') {
            await connection.query(`UPDATE users SET money = money + ? WHERE id_user = ?`, [money_value, id_user]);
        }
        if (buff_acc == '2') {
            await connection.query(`UPDATE users SET money = money - ? WHERE id_user = ?`, [money_value, id_user]);
        }
        return res.status(200).json({
            message: 'Successful change',
            status: true,
        });
    } else {
        return res.status(200).json({
            message: 'Successful change',
            status: false,
        });
    }
}
const randomNumber = (min, max) => {
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

const randomString = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

const ipAddress = (req) => {
    let ip = '';
    if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(",")[0];
    } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else {
        ip = req.ip;
    }
    return ip;
}

const timeCreate = () => {
    const d = new Date();
    const time = d.getTime();
    return time;
}
 


const register = async(req, res) => {
    let { username, password, invitecode } = req.body;
    let id_user = randomNumber(10000, 99999);
    let name_user = "Member" + randomNumber(10000, 99999);
    let code = randomString(5) + randomNumber(10000, 99999);
    let ip = ipAddress(req);
    let time = timeCreate();

    invitecode = '2cOCs36373';

    if (!username || !password || !invitecode) {
        return res.status(200).json({
            message: 'ERROR!!!',
            status: false
        });
    }

    if (!username) {
        return res.status(200).json({
            message: 'phone error',
            status: false
        });
    }

    try {
        const [check_u] = await connection.query('SELECT * FROM users WHERE phone = ? ', [username]);
        if (check_u.length == 1) {
            return res.status(200).json({
                message: 'register account', //Số điện thoại đã được đăng ký
                status: false
            });
        } else {
            const sql = `INSERT INTO users SET 
            id_user = ?,
            phone = ?,
            name_user = ?,
            password = ?,
            money = ?,
            level = ?,
            code = ?,
            invite = ?,
            veri = ?,
            ip_address = ?,
            status = ?,
            time = ?`;
            await connection.execute(sql, [id_user, username, name_user, md5(password), 0, 2, code, invitecode, 1, ip, 1, time]);
            await connection.execute('INSERT INTO point_list SET phone = ?, level = 2', [username]);
            return res.status(200).json({
                message: 'registration success',//Register Sucess
                status: true
            });
        }
    } catch (error) {
        if (error) console.log(error);
    }

}

const profileUser = async(req, res) => {
    let phone = req.body.phone;
    if (!phone) {
        return res.status(200).json({
            message: 'Phone Error',
            status: false,
            timeStamp: timeNow,
        });
    }
    let [user] = await connection.query(`SELECT * FROM users WHERE phone = ?`, [phone]);

    if (user.length == 0) {
        return res.status(200).json({
            message: 'Phone Error',
            status: false,
            timeStamp: timeNow,
        });
    }
    let [recharge] = await connection.query(`SELECT * FROM recharge WHERE phone = ? ORDER BY id DESC LIMIT 10`, [phone]);
    let [withdraw] = await connection.query(`SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC LIMIT 10`, [phone]);
    return res.status(200).json({
        message: 'Get success',
        status: true,
        recharge: recharge,
        withdraw: withdraw,
    });
}

const infoCtv = async(req, res) => {
    const phone = req.body.phone;
     
    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);

    if (user.length == 0) {
        return res.status(200).json({
            message: 'Phone Error',
            status: false,
        });
    }
    let userInfo = user[0];
    // cấp dưới trực tiếp all
    const [f1s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ', [userInfo.code]);

    // cấp dưới trực tiếp hôm nay 
    let f1_today = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_time = f1s[i].time; // Mã giới thiệu f1
        let check = (timerJoin(f1_time) == timerJoin()) ? true : false;
        if(check) {
            f1_today += 1;
        }
    }

    // tất cả cấp dưới hôm nay 
    let f_all_today = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const f1_time = f1s[i].time; // time f1
        let check_f1 = (timerJoin(f1_time) == timerJoin()) ? true : false;
        if(check_f1) f_all_today += 1;
        // tổng f1 mời đc hôm nay
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code; // Mã giới thiệu f2
            const f2_time = f2s[i].time; // time f2
            let check_f2 = (timerJoin(f2_time) == timerJoin()) ? true : false;
            if(check_f2) f_all_today += 1;
            // tổng f2 mời đc hôm nay
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ', [f2_code]);
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code; // Mã giới thiệu f3
                const f3_time = f3s[i].time; // time f3
                let check_f3 = (timerJoin(f3_time) == timerJoin()) ? true : false;
                if(check_f3) f_all_today += 1;
                const [f4s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ', [f3_code]);
                // tổng f3 mời đc hôm nay
                for (let i = 0; i < f4s.length; i++) {
                    const f4_code = f4s[i].code; // Mã giới thiệu f4
                    const f4_time = f4s[i].time; // time f4
                    let check_f4 = (timerJoin(f4_time) == timerJoin()) ? true : false;
                    if(check_f4) f_all_today += 1;
                    // tổng f3 mời đc hôm nay
                }
            }
        }
    }
    
    // Tổng số f2
    let f2 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f1_code]);
        f2 += f2s.length;
    }
    
    // Tổng số f3
    let f3 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f2_code]);
            if(f3s.length > 0) f3 += f3s.length;
        }
    }
    
    // Tổng số f4
    let f4 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f2_code]);
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code;
                const [f4s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f3_code]);
                if(f4s.length > 0) f4 += f4s.length;
            }
        }
    }

    const [list_mem] = await connection.query('SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ', [phone]);
    const [list_mem_baned] = await connection.query('SELECT * FROM users WHERE ctv = ? AND status = 2 AND veri = 1 ', [phone]);
    let total_recharge = 0;
    let total_withdraw = 0;
    for (let i = 0; i < list_mem.length; i++) {
        let phone = list_mem[i].phone;
        const [recharge] = await connection.query('SELECT SUM(money) as money FROM recharge WHERE phone = ? AND status = 1 ', [phone]);
        const [withdraw] = await connection.query('SELECT SUM(money) as money FROM withdraw WHERE phone = ? AND status = 1 ', [phone]);
        if (recharge[0].money) {
            total_recharge += Number(recharge[0].money);
        }
        if (withdraw[0].money) {
            total_withdraw += Number(withdraw[0].money);
        }
    }

    let total_recharge_today = 0;
    let total_withdraw_today = 0;
    for (let i = 0; i < list_mem.length; i++) {
        let phone = list_mem[i].phone;
        const [recharge_today] = await connection.query('SELECT `money`, `time` FROM recharge WHERE phone = ? AND status = 1 ', [phone]);
        const [withdraw_today] = await connection.query('SELECT `money`, `time` FROM withdraw WHERE phone = ? AND status = 1 ', [phone]);
        for (let i = 0; i < recharge_today.length; i++) {
            let today = timerJoin();
            let time = timerJoin(recharge_today[i].time);
            if (time == today) {
                total_recharge_today += recharge_today[i].money;
            }
        }
        for (let i = 0; i < withdraw_today.length; i++) {
            let today = timerJoin();
            let time = timerJoin(withdraw_today[i].time);
            if (time == today) {
                total_withdraw_today += withdraw_today[i].money;
            }
        }
    }

    let win = 0;
    let loss = 0;
    for (let i = 0; i < list_mem.length; i++) {
        let phone = list_mem[i].phone;
        const [wins] = await connection.query('SELECT `money`, `time` FROM minutes_1 WHERE phone = ? AND status = 1 ', [phone]);
        const [losses] = await connection.query('SELECT `money`, `time` FROM minutes_1 WHERE phone = ? AND status = 2 ', [phone]);
        for (let i = 0; i < wins.length; i++) {
            let today = timerJoin();
            let time = timerJoin(wins[i].time);
            if (time == today) {
                win += wins[i].money;
            }
        }
        for (let i = 0; i < losses.length; i++) {
            let today = timerJoin();
            let time = timerJoin(losses[i].time);
            if (time == today) {
                loss += losses[i].money;
            }
        }
    }
    let list_mems = [];
    const [list_mem_today] = await connection.query('SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ', [phone]);
    for (let i = 0; i < list_mem_today.length; i++) {
        let today = timerJoin();
        let time = timerJoin(list_mem_today[i].time);
        if (time == today) {
            list_mems.push(list_mem_today[i]);
        }
    }

    const [point_list] = await connection.query('SELECT * FROM point_list WHERE phone = ? ', [phone]);
    let moneyCTV = point_list[0].money;

    let list_recharge_news = [];
    let list_withdraw_news = [];
    for (let i = 0; i < list_mem.length; i++) {
        let phone = list_mem[i].phone;
        const [recharge_today] = await connection.query('SELECT `id`, `status`, `type`,`phone`, `money`, `time` FROM recharge WHERE phone = ? AND status = 1 ', [phone]);
        const [withdraw_today] = await connection.query('SELECT `id`, `status`,`phone`, `money`, `time` FROM withdraw WHERE phone = ? AND status = 1 ', [phone]);
        for (let i = 0; i < recharge_today.length; i++) {
            let today = timerJoin();
            let time = timerJoin(recharge_today[i].time);
            if (time == today) {
                list_recharge_news.push(recharge_today[i]);
            }
        }
        for (let i = 0; i < withdraw_today.length; i++) {
            let today = timerJoin();
            let time = timerJoin(withdraw_today[i].time);
            if (time == today) {
                list_withdraw_news.push(withdraw_today[i]);
            }
        }
    }

    const [redenvelopes_used] = await connection.query('SELECT * FROM redenvelopes_used WHERE phone = ? ', [phone]);
    let redenvelopes_used_today = [];
    for (let i = 0; i < redenvelopes_used.length; i++) {
        let today = timerJoin();
        let time = timerJoin(redenvelopes_used[i].time);
        if (time == today) {
            redenvelopes_used_today.push(redenvelopes_used[i]);
        }
    }

    const [financial_details] = await connection.query('SELECT * FROM financial_details WHERE phone = ? ', [phone]);
    let financial_details_today = [];
    for (let i = 0; i < financial_details.length; i++) {
        let today = timerJoin();
        let time = timerJoin(financial_details[i].time);
        if (time == today) {
            financial_details_today.push(financial_details[i]);
        }
    }


    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: user,    
        f1: f1s.length,
        f2: f2,
        f3: f3,
        f4: f4,
        list_mems: list_mems,
        total_recharge: total_recharge,
        total_withdraw: total_withdraw,
        total_recharge_today: total_recharge_today,
        total_withdraw_today: total_withdraw_today,
        list_mem_baned: list_mem_baned.length,
        win: win,
        loss: loss,
        list_recharge_news: list_recharge_news,
        list_withdraw_news: list_withdraw_news,
        moneyCTV: moneyCTV,
        redenvelopes_used: redenvelopes_used_today,
        financial_details_today: financial_details_today,
    });
}

const infoCtv2 = async(req, res) => {
    const phone = req.body.phone;
    const timeDate = req.body.timeDate;
     
    function timerJoin(params = '') {
        let date = '';
        if (params) {
          date = new Date(Number(params));
        } else {
          date = Date.now();
          date = new Date(Number(date));
        }
        let years = formateT(date.getFullYear());
        let months = formateT(date.getMonth() + 1);
        let days = formateT(date.getDate());
        let weeks = formateT(date.getDay());
      
        let hours = formateT(date.getHours());
        let minutes = formateT(date.getMinutes());
        let seconds = formateT(date.getSeconds());
        // return years + '-' + months + '-' + days + ' ' + hours + '-' + minutes + '-' + seconds;
        return years + "-" + months + "-" + days;
    }
    
    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);

    if (user.length == 0) {
        return res.status(200).json({
            message: 'Phone Error',
            status: false,
        });
    }
    let userInfo = user[0];
    const [list_mem] = await connection.query('SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ', [phone]);

    let list_mems = [];
    const [list_mem_today] = await connection.query('SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ', [phone]);
    for (let i = 0; i < list_mem_today.length; i++) {
        let today = timeDate;
        let time = timerJoin(list_mem_today[i].time);
        if (time == today) {
            list_mems.push(list_mem_today[i]);
        }
    }

    let list_recharge_news = [];
    let list_withdraw_news = [];
    for (let i = 0; i < list_mem.length; i++) {
        let phone = list_mem[i].phone;
        const [recharge_today] = await connection.query('SELECT `id`, `status`, `type`,`phone`, `money`, `time` FROM recharge WHERE phone = ? AND status = 1 ', [phone]);
        const [withdraw_today] = await connection.query('SELECT `id`, `status`,`phone`, `money`, `time` FROM withdraw WHERE phone = ? AND status = 1 ', [phone]);
        for (let i = 0; i < recharge_today.length; i++) {
            let today = timeDate;
            let time = timerJoin(recharge_today[i].time);
            if (time == today) {
                list_recharge_news.push(recharge_today[i]);
            }
        }
        for (let i = 0; i < withdraw_today.length; i++) {
            let today = timeDate;
            let time = timerJoin(withdraw_today[i].time);
            if (time == today) {
                list_withdraw_news.push(withdraw_today[i]);
            }
        }
    }

    const [redenvelopes_used] = await connection.query('SELECT * FROM redenvelopes_used WHERE phone = ? ', [phone]);
    let redenvelopes_used_today = [];
    for (let i = 0; i < redenvelopes_used.length; i++) {
        let today = timeDate;
        let time = timerJoin(redenvelopes_used[i].time);
        if (time == today) {
            redenvelopes_used_today.push(redenvelopes_used[i]);
        }
    }

    const [financial_details] = await connection.query('SELECT * FROM financial_details WHERE phone = ? ', [phone]);
    let financial_details_today = [];
    for (let i = 0; i < financial_details.length; i++) {
        let today = timeDate;
        let time = timerJoin(financial_details[i].time);
        if (time == today) {
            financial_details_today.push(financial_details[i]);
        }
    }

    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: user,
        list_mems: list_mems,
        list_recharge_news: list_recharge_news,
        list_withdraw_news: list_withdraw_news,
        redenvelopes_used: redenvelopes_used_today,
        financial_details_today: financial_details_today,
    });
}

const listRechargeMem = async(req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    let phone = req.params.phone;
    let {pageno, limit } = req.body;

    if (!pageno || !limit) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (pageno < 0 || limit < 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (!phone) {
        return res.status(200).json({
            message: 'Failed',
            status: false, 
            timeStamp: timeNow,
        });
    }

    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);
    const [auths] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0 || auths.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false, 
            timeStamp: timeNow,
        });
    }
    let { token, password, otp, level,...userInfo } = user[0];

    const [recharge] = await connection.query(`SELECT * FROM recharge WHERE phone = ? ORDER BY id DESC LIMIT ${pageno}, ${limit} `, [phone]);
    const [total_users] = await connection.query(`SELECT * FROM recharge WHERE phone = ?`, [phone]);
    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: recharge,
        page_total: Math.ceil(total_users.length / limit)
    });
}

const listWithdrawMem = async(req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    let phone = req.params.phone;
    let {pageno, limit } = req.body;

    if (!pageno || !limit) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (pageno < 0 || limit < 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (!phone) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);
    const [auths] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0 || auths.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false, 
            timeStamp: timeNow,
        });
    }
    let { token, password, otp, level,...userInfo } = user[0];

    const [withdraw] = await connection.query(`SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC LIMIT ${pageno}, ${limit} `, [phone]);
    const [total_users] = await connection.query(`SELECT * FROM withdraw WHERE phone = ?`, [phone]);
    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: withdraw,
        page_total: Math.ceil(total_users.length / limit)
    });
}

const listRedenvelope = async(req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    let phone = req.params.phone;
    let {pageno, limit } = req.body;

    if (!pageno || !limit) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (pageno < 0 || limit < 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (!phone) {
        return res.status(200).json({
            message: 'Failed',
            status: false, 
            timeStamp: timeNow,
        });
    }

    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);
    const [auths] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0 || auths.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false, 
            timeStamp: timeNow,
        });
    }
    let { token, password, otp, level,...userInfo } = user[0];

    const [redenvelopes_used] = await connection.query(`SELECT * FROM redenvelopes_used WHERE phone_used = ? ORDER BY id DESC LIMIT ${pageno}, ${limit} `, [phone]);
    const [total_users] = await connection.query(`SELECT * FROM redenvelopes_used WHERE phone_used = ?`, [phone]);
    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: redenvelopes_used,
        page_total: Math.ceil(total_users.length / limit)
    });
}

const listBet = async(req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    let phone = req.params.phone;
    let {pageno, limit } = req.body;

    if (!pageno || !limit) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (pageno < 0 || limit < 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (!phone) {
        return res.status(200).json({
            message: 'Failed',
            status: false, 
            timeStamp: timeNow,
        });
    }

    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);
    const [auths] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0 || auths.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false, 
            timeStamp: timeNow,
        });
    }
    let { token, password, otp, level,...userInfo } = user[0];

    const [listBet] = await connection.query(`SELECT * FROM minutes_1 WHERE phone = ? AND status != 0 ORDER BY id DESC LIMIT ${pageno}, ${limit} `, [phone]);
    const [total_users] = await connection.query(`SELECT * FROM minutes_1 WHERE phone = ? AND status != 0`, [phone]);
    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: listBet,
        page_total: Math.ceil(total_users.length / limit)
    });
}

const listOrderOld = async (req, res) => {
    let { gameJoin } = req.body;

    let checkGame = ['1', '3', '5', '10'].includes(String(gameJoin));
    if (!checkGame) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }
    let game = Number(gameJoin);

    let join = '';
    if(game == 1) join = 'k5d';
    if(game == 3) join = 'k5d3';
    if(game == 5) join = 'k5d5';
    if(game == 10) join = 'k5d10';

    const [k5d] = await connection.query(`SELECT * FROM 5d WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 10 `);
    const [period] = await connection.query(`SELECT period FROM 5d WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `);
    const [waiting] = await connection.query(`SELECT phone, money, price, amount, bet FROM result_5d WHERE status = 0 AND level = 0 AND game = '${game}' ORDER BY id ASC `);
    const [settings] = await connection.query(`SELECT ${join} FROM admin`);
    if (k5d.length == 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }
    if (!k5d[0] || !period[0]) {
        return res.status(200).json({
            message: 'Error!',
            status: false
        });
    }
    return res.status(200).json({
        code: 0,
        msg: "Get success",
        data: {
            gameslist: k5d,
        },
        bet: waiting,
        settings: settings,
        join: join,
        period: period[0].period,
        status: true
    });
}

const listOrderOldK3 = async (req, res) => {
    let { gameJoin } = req.body;

    let checkGame = ['1', '3', '5', '10'].includes(String(gameJoin));
    if (!checkGame) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }
    let game = Number(gameJoin);

    let join = '';
    if(game == 1) join = 'k3d';
    if(game == 3) join = 'k3d3';
    if(game == 5) join = 'k3d5';
    if(game == 10) join = 'k3d10';

    const [k5d] = await connection.query(`SELECT * FROM k3 WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 10 `);
    const [period] = await connection.query(`SELECT period FROM k3 WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `);
    const [waiting] = await connection.query(`SELECT phone, money, price, typeGame, amount, bet FROM result_k3 WHERE status = 0 AND level = 0 AND game = '${game}' ORDER BY id ASC `);
    const [settings] = await connection.query(`SELECT ${join} FROM admin`);
    if (k5d.length == 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }
    if (!k5d[0] || !period[0]) {
        return res.status(200).json({
            message: 'Error!',
            status: false
        });
    }
    return res.status(200).json({
        code: 0,
        msg: "Get success",
        data: {
            gameslist: k5d,
        },
        bet: waiting,
        settings: settings,
        join: join,
        period: period[0].period,
        status: true
    });
}

const editResult = async(req, res) => {
    let { game, list } = req.body;

    if (!list || !game) {
        return res.status(200).json({
            message: 'ERROR!!!',
            status: false
        });
    }

    let join = '';
    if(game == 1) join = 'k5d';
    if(game == 3) join = 'k5d3';
    if(game == 5) join = 'k5d5';
    if(game == 10) join = 'k5d10';

    const sql = `UPDATE admin SET ${join} = ?`;
    await connection.execute(sql, [list]);
    return res.status(200).json({
        message: 'Chỉnh sửa thành công',//Register Sucess
        status: true
    });

}

const editResult2 = async(req, res) => {
    let { game, list } = req.body;

    if (!list || !game) {
        return res.status(200).json({
            message: 'ERROR!!!',
            status: false
        });
    }

    let join = '';
    if(game == 1) join = 'k3d';
    if(game == 3) join = 'k3d3';
    if(game == 5) join = 'k3d5';
    if(game == 10) join = 'k3d10';

    const sql = `UPDATE admin SET ${join} = ?`;
    await connection.execute(sql, [list]);
    return res.status(200).json({
        message: 'Chỉnh sửa thành công',//Register Sucess
        status: true
    });

}

const aiBonus = async (req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    if (!auth) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: new Date().toISOString(),
        });
    }

    try {
        const [aiBonuses] = await connection.query(
            'SELECT id, user_id, amount, comm, created_at FROM incomes WHERE remarks = "AI bonus"'
        );

        if (aiBonuses.length === 0) {
            return res.status(200).json({
                message: 'No AI bonuses found',
                status: false,
                timeStamp: new Date().toISOString(),
            });
        }

        // Fetch phone numbers for the corresponding user_ids
        const userIds = aiBonuses.map(bonus => bonus.user_id);
        const [users] = await connection.query(
            'SELECT id, phone FROM users WHERE id IN (?)',
            [userIds]
        );

        // Create a map of user_id to phone
        const userIdToPhoneMap = {};
        users.forEach(user => {
            userIdToPhoneMap[user.id] = user.phone;
        });

        // Attach phone numbers to the aiBonuses data
        const aiBonusesWithPhone = aiBonuses.map(bonus => ({
            ...bonus,
            phone: userIdToPhoneMap[bonus.user_id]
        }));

        return res.status(200).json({
            message: 'Success',
            status: true,
            data: aiBonusesWithPhone,
            timeStamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal Server Error',
            status: false,
            timeStamp: new Date().toISOString(),
        });
    }
};

const createSalary = async (req, res) => {
    const { phone, amount, type, remarks } = req.body;
    const timeNow = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (!phone || !amount || !type || !remarks) {
        return res.status(400).json({
            message: 'All fields are required',
            status: false,
            timeStamp: timeNow,
        });
    }

    try {
        const [userResult] = await connection.query('SELECT `id`, `money`, `able_to_bet` FROM users WHERE `id_user` = ?', [phone]);
        
        if (!userResult.length) {
            return res.status(404).json({
                message: 'User not found',
                status: false,
                timeStamp: timeNow,
            });
        }

        const user = userResult[0];
        const updatedMoney = parseFloat(user.money) + parseFloat(amount);
        const updatedBetMoney = parseFloat(user.able_to_bet) + parseFloat(amount);

        // Update the user's money and able_to_bet
        const [updateResult] = await connection.query(
            'UPDATE users SET `money` = ?, `able_to_bet` = ? WHERE `id` = ?', 
            [updatedMoney, updatedBetMoney, user.id]
        );

        // Insert the new record into the incomes table
        await connection.query(
            'INSERT INTO incomes (`user_id`, `rname`, `amount`, `comm`, `bet`, `remarks`) VALUES (?, ?, ?, ?, ?, ?)',
            [user.id, phone, amount, amount, type, remarks]
        );

        return res.status(200).json({
            message: 'Success',
            status: true,
            timeStamp: timeNow,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal Server Error',
            status: false,
            timeStamp: timeNow,
        });
    }
};





const dailyBonus = async (req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    if (!auth) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: new Date().toISOString(),
        });
    }

    try {
        const [dailyBonuses] = await connection.query(`
            SELECT incomes.*, users.phone 
            FROM incomes 
            JOIN users ON incomes.user_id = users.id 
            WHERE incomes.remarks = "Daily Salary Bonus"
        `);

        if (dailyBonuses.length === 0) {
            return res.status(200).json({
                message: 'No Daily Salary Bonuses found',
                status: false,
                timeStamp: new Date().toISOString(),
            });
        }

        return res.status(200).json({
            message: 'Success',
            status: true,
            data: dailyBonuses,
            timeStamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal Server Error',
            status: false,
            timeStamp: new Date().toISOString(),
        });
    }
};


const updateIncomeStatus = async (req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    let id = req.body.id;
    let type = req.body.type;
    let timeNow = new Date().toISOString();

    if (!auth || !id || !type) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    try {
        if (type === 'confirm') {
            await connection.query('UPDATE incomes SET rname = 1 WHERE id = ?', [id]);
            const [incomeInfo] = await connection.query('SELECT comm, user_id FROM incomes WHERE id = ?', [id]);
            const { comm, user_id } = incomeInfo[0];
            await connection.query('UPDATE users SET money = money + ? WHERE id = ?', [comm, user_id]);

            return res.status(200).json({
                message: 'Income confirmed successfully',
                status: true,
                data: { id, comm },
                timeStamp: timeNow,
            });
        }

        if (type === 'delete') {
            await connection.query('UPDATE incomes SET rname = 2 WHERE id = ?', [id]);

            return res.status(200).json({
                message: 'Income deleted successfully',
                status: true,
                data: { id },
                timeStamp: timeNow,
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal Server Error',
            status: false,
            timeStamp: timeNow,
        });
    }
};

const incomeBonus = async (req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    let timeNow = new Date().toISOString();

    if (!auth) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    try {
        const [incomes] = await connection.query(`
            SELECT id, user_id, updated_at, amount, comm, remarks 
            FROM incomes 
            WHERE remarks != 'Ai bonus' 
            AND (remarks != 'Daily Salary Bonus' OR (remarks = 'Daily Salary Bonus' AND rname != '0'))
            ORDER BY updated_at DESC
        `);

        const userPromises = incomes.map(async (income) => {
            const [user] = await connection.query('SELECT phone FROM users WHERE id = ?', [income.user_id]);
            return { ...income, phone: user[0]?.phone || null };
        });

        const incomeResults = await Promise.all(userPromises);

        return res.status(200).json({
            message: 'Success',
            status: true,
            datas: incomeResults,
            timeStamp: timeNow,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal Server Error',
            status: false,
            timeStamp: timeNow,
        });
    }
};


const listStreakBonuses = async (req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    if (!auth) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: new Date().toISOString(),
        });
    }

    try {
        const [streakBonuses] = await connection.query(
            'SELECT * FROM streak_bonus where status=0'
        );

        if (streakBonuses.length === 0) {
            return res.status(200).json({
                message: 'No streak bonuses found',
                status: false,
                timeStamp: new Date().toISOString(),
            });
        }

        return res.status(200).json({
            message: 'Success',
            status: true,
            data: streakBonuses,
            timeStamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal Server Error',
            status: false,
            timeStamp: new Date().toISOString(),
        });
    }
};

const updateStreakStatus = async (req, res) => {
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth =md5(authtoken);
    let id = req.body.id;
    let type = req.body.type;
    let timeNow = new Date().toISOString();

    if (!auth || !id || !type) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    try {
        if (type === 'confirm') {
            await connection.query('UPDATE streak_bonus SET status = 1 WHERE id = ?', [id]);
            const [streakInfo] = await connection.query('SELECT amount, phone FROM streak_bonus WHERE id = ?', [id]);
            const { amount, phone } = streakInfo[0];
            await connection.query('UPDATE users SET money = money + ? WHERE phone = ?', [amount, phone]);

            return res.status(200).json({
                message: 'Streak confirmed successfully',
                status: true,
                data: { id, amount },
                timeStamp: timeNow,
            });
        }

        if (type === 'delete') {
            await connection.query('UPDATE streak_bonus SET status = 2 WHERE id = ?', [id]);

            return res.status(200).json({
                message: 'Streak deleted successfully',
                status: true,
                data: { id },
                timeStamp: timeNow,
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal Server Error',
            status: false,
            timeStamp: timeNow,
        });
    }
};

module.exports = {
    adminPage,
    adminPage3,
    adminPage5,
    adminPage10,
    totalJoin,
    middlewareAdminController,
    changeAdmin,
    membersPage,
    listMember,
    infoMember,
    userInfo,
    statistical,
    statistical2,
    rechargePage,
    recharge,
    rechargeDuyet,
    rechargeRecord,
    withdrawRecord,
    withdraw,
    handlWithdraw,
    settings,
    editResult2,
    settingBank,
    settingGet,
    settingCskh,
    settingbuff,
    register,
    ctvPage,
    listCTV,
    profileUser,
    ctvProfilePage,
    infoCtv,
    infoCtv2,
    giftPage,
    createBonus,
    listRedenvelops,
    banned,
    listRechargeMem,
    listWithdrawMem,
    listRedenvelope,
    listBet,
    adminPage5d,
    listOrderOld,
    listOrderOldK3,
    editResult,
    adminPageK3,
    withdrawCrytp,
    rechargemanual,
    aiBonus,
    dailyBonus,
    updateIncomeStatus,
    incomeBonus,
    listStreakBonuses,
    updateStreakStatus,
    dailybonusrecord,
    aibonusrecord,
    incomebonusrecord,
    Streakbonusrecord,
    salaryPage,
    createSalary,
    listSalaryBonus,
    middlewareMainAdminController
}