import express from 'express';

import { getServices, createService, getService, getServiceVersion, updateService, deleteService } from '../controllers/services.js';

const router = express.Router();

router.get('/', getServices); // search, asc, sort, page
router.post('/', createService);
router.get('/:id', getService); // return service detail with #version available
router.get('/:id/versions', getServiceVersion); // return list of version
router.patch('/:id', updateService);
router.delete('/:id', deleteService);

export default router;