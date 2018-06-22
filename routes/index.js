var express = require('express');
var router = express.Router();
var Model = require('../model/index').models
var dataBase = require('../model/index')
var multer = require('multer');
var fs = require('fs')
var rootPath = require('../rootPath')
var storage = multer.diskStorage({
    //设置上传后文件路径，uploads文件夹会自动创建。
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    //给上传文件重命名，获取添加后缀名
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
});
var upload = multer({
    storage: storage
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});


// 管理员登录请求
router.post('/adminLogin', function (req, res, next) {
    var username = req.body.username
    var password = req.body.password
    Model.Admin.find({ username: username, password: password }, function (err, user) {
        if (user.length === 0) {
          res.send(JSON.stringify({
              status: 'error'
          }))
        } else {
            req.session.admin_Login = true
          res.send(JSON.stringify({
              status: 'ok',
              aid: user[0].id
          }))
        }
    })
})

// 检测管理员是否登录 同步后台与前端的登录控制
router.get('/adminIsLogin', function (req, res) {
    if ( req.session.admin_Login ) {
        res.send(JSON.stringify({
            status: 'ok'
        }))
    } else {
        res.send( JSON.stringify({
            status: 'noLogin'
        }) )
    }
})

// 管理员退出登录请求
router.post('/adminLoginOut', function (req, res) {
    req.session.admin_Login = false
    res.send(JSON.stringify({
        status: 'ok'
    }))
})

// 查询客户个数请求
router.get('/getCusTotal', function (req, res) {
    Model.Customer.find().count(function (err, count) {
        res.send(JSON.stringify({total: count}))
    })
})
// 获取用户列表  参数：分页参数(page, num)  用户编号(cus_id)  用户名称(cus_name)  电话(cus_tel)
router.get('/getCusList', function (req, res) {
    var page = req.query.page
    var num = req.query.num
    var id = req.query.id
    var cus_name = req.query.cus_name
    var cus_tel = req.query.cus_tel
    // dataBase.db.driver.execQuery
    var select = 'SELECT cus.active as active, cus.username as username, cus.id as id, cus.cus_name as cus_name, cus.cus_tel as cus_tel, cus.cus_place as cus_place FROM customer as cus where 1 = 1 '
    if (id) {
        select += ' and id = ' + id
    }
    if (cus_name) {
        select += ' and cus_name =  ' + '"'+cus_name+'"'
    }
    if (cus_tel) {
        select += ' and cus_tel =  ' + cus_tel
    }
    select += ' limit ' + num + ' offset ' + page
    dataBase.db.driver.execQuery(select, function (err, customer) {
        if (err) {
            console.log(err)
        }
        res.send(JSON.stringify(customer))
    })
})
// 获取商品类别
router.get('/getGoosCategory', function (req, res) {
    dataBase.db.driver.execQuery('SELECT * from category', function (err, category) {
        res.send(JSON.stringify(category))
    })
})
// 获取商品接口 参数：page num 编号 菜品名 分类   isSales是否根据销量排序
router.get('/getGoods', function (req, res) {
    // dataBase.db.driver.execQuery
    var page = req.query.page
    var num = req.query.num
    var id = req.query.id
    var goods_name = req.query.goods_name
    var category_id = req.query.category_id
    var active = req.query.active
    var isSales = req.query.isSales
    var time = req.query.time
    var keywords = req.query.keywords
    // if (keywords.length === 0) {
    //     keywords = parseInt(keywords )
    // }

    var select = 'select * from goods where 1=1 '
    if ( id ) {
        select += ' and id= ' + id
    }
    if (goods_name) {
        select += ' and goods_name like ' +'"%'+ goods_name +'%"'
    }
    if (keywords) {
        select += ' and category_id = ' + '"' +keywords+'"' + ' or goods_name like ' + '"%'+ keywords +'%"'
    }
    if (category_id) {
        select += ' and category_id= ' + category_id
    }
    if (active) {
        select += ' and active= ' + active
    }
    if (isSales) {
        select += ' order by sales desc '
    }
    if (time) {
        select += ' order by create_time desc '
    }
    if ( page && num ) {
        select += ' limit ' + num + ' offset ' +page
    }
    dataBase.db.driver.execQuery(select, function (err, goods) {
        console.log(err)
        res.send(JSON.stringify(goods))
    })
})

//获取商品信息以及确定商品是否收藏
router.get('/getUserGoods', function (req, res) {
    var gid = req.query.gid
    var cid = req.query.cid
    var select = 'SELECT\n' +
        '\tg.id as id,\n' +
        '\tg.goods_name as goods_name,\n' +
        '\tg.goods_img as goods_img,\n' +
        '\tg.category_id as category_id,\n' +
        '\tg.goods_price as goods_price,\n' +
        '\tg.active as active,\n' +
        '\tg.inventory as inventory,\n' +
        '\tg.sales as sales,\n' +
        '\tg.goods_details as goods_details,\n' +
        '\tg.goods_specifications as goods_specifications,\n' +
        '\tu.active as isStart\n' +
        'FROM\n' +
        '\tgoods AS g\n' +
        'LEFT JOIN userstart AS u ON g.id = u.gid\n' +
        'AND u.cid = ' + cid + ' and u.active = 1 ' +
        ' WHERE\n' +
        '\tg.id = ' + gid
    dataBase.db.driver.execQuery(select, function (err, data) {
        res.send(JSON.stringify(data))
    })
})

// 获取商品total
router.get('/getGoodsTotal', function (req, res) {
    Model.Goods.find().count(function (err, count) {
        res.send(JSON.stringify({total: count}))
    })
})



// cekditor图片上传路径
router.post('/magazines/upload_img',upload.single("upload"),  function (req, res) {
    var image = req.file.path
    var newPath = 'uploads/' + req.file.originalname
    var CKEditorFuncNum = req.query.CKEditorFuncNum
    fs.rename( image, newPath, function (err) {
        if (err) {
            throw err
        } else {
            var back = '<script type="text/javascript" >' +
                "window.parent.CKEDITOR.tools.callFunction("+ CKEditorFuncNum + ",'" +rootPath+ "/" + newPath + "','')" +
                '</script>'
            res.send(back)
        }
    } )
})
// 客户端登录请求
router.post('/clientLogin', function (req, res) {
    var username = req.body.username
    var password = req.body.password
    Model.Customer.find({username: username, password: password}, function (err, data) {
        if ( data.length!==0 ) {
            if ( data[0].active === 0 ) {
                // 账户未被激活
                res.send({
                    status: 'noActive'
                })
                return false
            }
            req.session.client_login = true
            res.send(JSON.stringify({
                status: 'ok',
                cus_id: data[0].id,
                cus_name: data[0].cus_name
            }))
        } else {
            res.send(JSON.stringify({
                status: 'error'
            }))
        }
    })
})

// 客户端退出登录请求
router.post('/clientLoginOut', function (req, res) {
    req.session.client_login = false
    res.send(JSON.stringify({
        status: 'ok'
    }))
})

// 检测客户端是否登录 同步后台与前端的登录控制
router.get('/cusIsLogin', function (req, res) {
    if ( req.session.client_login ) {
        res.send(JSON.stringify({
            status: 'ok'
        }))
    } else {
        res.send( JSON.stringify({
            status: 'noLogin'
        }) )
    }
})

// 获取客户购物车商品信息
router.get('/getShopcar', function (req, res) {
    var cid = req.query.cid
    var select = 'SELECT\n' +
        '\tshop.id as sid,\n' +
        '\tgoods.id as gid,\n' +
        '\tshop.count as count,\n' +
        '\tgoods.goods_price as goods_price,\n' +
        '\tgoods.goods_name as goods_name,\n' +
        '\tgoods.goods_img as goods_img,\n' +
        '\tgoods.inventory as inventory,\n' +
        '\tshop.create_time as create_time,\n' +
        '\tgoods.active as active\n' +
        'FROM\n' +
        '\tshopcar AS shop\n' +
        'LEFT JOIN goods AS goods ON shop.gid = goods.id\n' +
        'WHERE\n' +
        '\tshop.cid = ' + cid +
        '\t and shop.is_pay = 0' +
        ' ORDER BY\n' +
        '\tshop.create_time DESC'
    dataBase.db.driver.execQuery( select, function (err, data) {
        res.send(JSON.stringify(data))
    } )
})

// 获取未分配订单的数量
router.get('/getNoOrder_count', function (req, res) {
    Model.Order.find({is_distribut: 0}).count(function (err, count) {
        res.send(JSON.stringify({total: count}))
    })
})

// 获取未发货的订单  带搜索  用户名字 电话 商品类型
router.get('/getNoOrder', function (req, res) {
    var page = req.query.page
    var num = req.query.num
    var cus_name = req.query.cus_name
    var cus_id = req.body.cid  // 客户端获取的时候传入此参数， 只看自己的订单
    var category_id = req.query.category_id
    var id = req.query.id
    var select = 'SELECT\n' +
        '\tcorder.id as id,\n' +
        '\tcus.cus_name as cus_name,\n' +
        '\tcus.id as cid,\n' +
        '\tcus.cus_tel as cus_tel,\n' +
        '\tcus.cus_place as cus_place,\n' +
        '\tgoods.goods_name as goods_name,\n' +
        '\tcorder.unit_price as unit_price,\n' +
        '\tcorder.count as count,\n' +
        '\tcorder.total_price as total_price,\n' +
        '\tcorder.create_time as create_time\n' +
        'FROM\n' +
        '\tcorder AS corder\n' +
        'INNER JOIN customer AS cus ON corder.cid = cus.id \n' +
        'INNER JOIN goods as goods on corder.gid = goods.id\n' +
        'WHERE\n' +
        '  corder.is_distribut = 0\n'

        if ( cus_name ) {
            select += ' and cus.cus_name like ' + '"%'+ cus_name +'%"'
        }

        if ( category_id ) {
            select += ' and goods.category_id = ' + category_id
        }

        if ( id ) {
            select += ' and corder.id = ' + id
        }

        select += ' ORDER BY\n' +
        '\tcorder.create_time DESC\n'

        if (page && num) {
            select += ' LIMIT ' + num + ' OFFSET ' + page
        }


    dataBase.db.driver.execQuery(select, function (err, data) {
        console.log(err)
        res.send(JSON.stringify(data))
    })
})

// 获取已经发货的订单的条数
router.get('/getOrderTotal', function (req, res) {
    Model.Order.find({is_distribut: 1}).count(function (err, count) {
        res.send(JSON.stringify({total: count}))
    })
})

// 获取已经发货的订单  带搜索  用户名字 电话 商品类型  日期  以及分页参数
router.get('/getOrder', function (req, res) {
    var cus_id = req.query.cid
    var page = req.query.page
    var num = req.query.num
    var cus_name = req.query.cus_name
    var category_id = req.query.category_id
    var id = req.query.id
    var timeStar = req.query.timeStar
    var timeEnd = req.query.timeEnd
    var select = 'SELECT\n' +
        '\tcorder.id as id,\n' +
        '\tcus.cus_name as cus_name,\n' +
        '\tcus.id as cid,\n' +
        '\tcus.cus_tel as cus_tel,\n' +
        '\tcus.cus_place as cus_place,\n' +
        '\tgoods.goods_name as goods_name,\n' +
        '\tcorder.unit_price as unit_price,\n' +
        '\tcorder.count as count,\n' +
        '\tcorder.total_price as total_price,\n' +
        '\tcorder.create_time as create_time\n' +
        'FROM\n' +
        '\tcorder AS corder\n' +
        'INNER JOIN customer AS cus ON corder.cid = cus.id \n' +
        'INNER JOIN goods as goods on corder.gid = goods.id\n' +
        'WHERE\n' +
        '  corder.is_distribut = 1\n'
    // 订单id搜索
    if ( id ) {
        select += ' and corder.id = ' + id
    }
    // 用户名称搜搜
    if ( cus_name ) {
        select += ' and cus.cus_name like ' + '"%'+ cus_name +'%"'
    }
    // 商品分类搜索
    if ( category_id ) {
        select += ' and goods.category_id = ' + category_id
    }
    // 用户id搜索
    if ( cus_id ) {
        select += ' and cus.id = ' + cus_id
    }
    // 日期搜索
    if ( timeStar ) {
        timeStar = new Date(timeStar).toLocaleDateString()
        select += ' and corder.create_time >= ' + '"' + timeStar + '"'
    }
    if ( timeEnd ) {
        timeEnd = new Date(timeEnd).toLocaleDateString()
        select += ' and corder.create_time <= ' + '"' +timeEnd + '"'
    }
    select += ' ORDER BY\n' +
            '\tcorder.create_time DESC\n'

    if (page && num) {
        select += ' LIMIT ' + num + ' OFFSET ' + page
    }

    console.log(select)

    dataBase.db.driver.execQuery(select, function (err,data) {
        if (err) console.log(err)
        else res.send(JSON.stringify(data))
    })

})

// 客户查询订单   参数 page num 订单编号 商品类别  日期  是否送货
router.get('/userGetOrder', function (req, res) {
    var page = req.query.page
    var num = req.query.num
    var category_id = req.query.category_id
    var is_distribut = req.query.is_distribut
    var timeStar = req.query.timeStar
    var timeEnd = req.query.timeEnd
    var cus_id = req.query.cid
    var id = req.query.id

    var select = 'SELECT\n' +
        '\tcorder.id as id,\n' +
        '\tcus.cus_name as cus_name,\n' +
        '\tgoods.id as gid,\n' +
        '\tgoods.goods_img as goods_img,\n' +
        '\tcus.cus_tel as cus_tel,\n' +
        '\tcus.cus_place as cus_place,\n' +
        '\tgoods.goods_name as goods_name,\n' +
        '\tcorder.unit_price as unit_price,\n' +
        '\tcorder.count as count,\n' +
        '\tcorder.is_distribut as is_distribut,\n' +
        '\tcorder.total_price as total_price,\n' +
        '\tcorder.create_time as create_time\n' +
        'FROM\n' +
        '\tcorder AS corder\n' +
        'INNER JOIN customer AS cus ON corder.cid = cus.id \n' +
        'INNER JOIN goods as goods on corder.gid = goods.id\n' +
        'WHERE\n' +
        '  1=1 '
    // 订单id搜索
    if ( id ) {
        select += ' and corder.id = ' + id
    }
    // 商品分类搜索
    if ( category_id ) {
        select += ' and goods.category_id = ' + category_id
    }
    // 用户id搜索
    if ( cus_id ) {
        select += ' and cus.id = ' + cus_id
    }
    // 订单是否送货搜索
    if ( is_distribut ) {
        select += ' and corder.is_distribut = ' + is_distribut
    }
    // 日期搜索
    if ( timeStar ) {
        timeStar = new Date(timeStar).toLocaleDateString()
        select += ' and corder.create_time >= ' + '"' + timeStar + '"'
    }
    if ( timeEnd ) {
        timeEnd = new Date(timeEnd).toLocaleDateString()
        select += ' and corder.create_time <= ' + '"' +timeEnd + '"'
    }
    select += ' ORDER BY \n' +
        '\tcorder.create_time DESC\n'

    if (page && num) {
        select += ' LIMIT ' + num + ' OFFSET ' + page
    }
    dataBase.db.driver.execQuery(select, function (err,data) {
        if (err) console.log(err)
        else res.send(JSON.stringify(data))
    })
})

// 获取客户订单的总条数
router.get('/userGetOrder_count', function (req, res) {
    var cid = req.query.cid
    Model.Order.find({cid: cid}).count( function (err, count) {
        res.send(JSON.stringify({
            total: count
        }))
    } )
})

module.exports = router;
