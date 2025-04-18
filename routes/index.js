const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')
const BannerController = require('../controllers/bannerController')
const authentication = require('../middlewares/authentication')
const upload = require('../helpers/multer')
const TransactionController = require('../controllers/transactionController')

router.get('/', (req, res) => {
    res.send('Route Work!')
})

router.post('/registration', UserController.registration);
router.post('/login', UserController.login);
router.get('/banner', BannerController.getBanners)
router.get('/services', BannerController.getServices)

router.use(authentication)
router.get('/profile', UserController.getProfile);

router.put('/profile/update', UserController.updateProfile);
router.put('/profile/image', upload.single('image'), UserController.updateImage);
router.get('/balance', TransactionController.getBalance);

module.exports = router