import express from 'express';
import mongoose from 'mongoose';

import {Service, ServiceVersion} from '../models/service.js';

const router = express.Router();
const PAGE_LIMIT = 5;

export const getServices = async (req, res) => { 
    const { search, sort } = req.query;
    console.log(req.query);
    const asc = req.query.asc || 1;
    var sortObj = {
        [sort]: asc
    };
    const page = req.query?.page || 1;
    console.log("get all services"); 
    console.log("page: " + page);
    const title = new RegExp(search, "i");
    const skipIndex = (Number(page) - 1) * PAGE_LIMIT;
    var totalServices, services;
    try {
        if (!search && !sort) {
            totalServices = await Service.estimatedDocumentCount({});
            services = await Service.find().sort({ title: 1 }).limit(PAGE_LIMIT).skip(skipIndex);
            
        } else if (search && sort) {
            totalServices = await Service.countDocuments({ $or: [ { title }, { description: title } ]});
            services = await Service.find({ $or: [ { title }, { description: title } ]}).sort(sortObj).limit(PAGE_LIMIT).skip(skipIndex);

        } else if (search) {
            totalServices = await Service.countDocuments({ $or: [ { title }, { description: title } ]});
            services = await Service.find({ $or: [ { title }, { description: title } ]}).limit(PAGE_LIMIT).skip(skipIndex);

        } else if (sort) {
            totalServices = await Service.estimatedDocumentCount({});
            services = await Service.find().sort(sortObj).limit(PAGE_LIMIT).skip(skipIndex);

        }
        
        res.status(200).json({ data: services, currentPage: Number(page), totalPage: Math.ceil(totalServices / PAGE_LIMIT)});
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createService = async (req, res) => {
    console.log("create services");
    const { title, description, detail} = req.body;
    console.log('title: ' + title);
    const dev = title.split(' ').join('_').toLowerCase();
    console.log('dev: ' + dev);

    try {
        const service = await Service.find({dev});
        // var newService, newServiceVersion;
        const retriveService = service.length > 0 ? service[0] : undefined;
        if (retriveService) {
            const newServiceVersion = new ServiceVersion({detail, version: retriveService.version.length + 1, releasedate: new Date()});
            retriveService.version.push(newServiceVersion);
            await Service.findOneAndUpdate({dev}, {version: retriveService.version});
            
            res.status(201).json(retriveService);
        } else {
            const newServiceVersion = new ServiceVersion({detail, version: 1, releasedate: new Date()});
            const newService = new Service({title, dev, version: [newServiceVersion], description });
            await newService.save();
            
            res.status(201).json(newService);
        }
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const getService = async (req, res) => { 
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No service with id: ${id}`);
    try {
        const service = await Service.find({_id: id});
        if (service.length > 0) {
            res.status(200).json({
                title: service[0].title,
                description: service[0].description,
                totalversion: service[0].version.length
            });
        } else {
            res.status(200).json(service);
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getServiceVersion = async (req, res) => {
    console.log("get service version");
    const { id } = req.params;
    try {
        var service, version;
        if (mongoose.Types.ObjectId.isValid(id)) {
            service = await Service.findById(id);
            if (service) {
                res.status(200).json(service.version);
            } else {
                res.status(200).json(service);
            }
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const updateService = async (req, res) => {
    const { id } = req.params;
    console.log("dev: " + id);
    const { title, description, url } = req.body;
    
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
        
        const updatedService = { title, description, _id: id };
    
        await Service.findByIdAndUpdate(id, updatedService, { new: true });
    
        res.json(updatedService);

    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}

export const deleteService = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No service with id: ${id}`);
    try {
        await Service.findByIdAndRemove(id);
        await ServiceVersion.findOneAndRemove({service: id});
        res.json({ message: "Service deleted successfully." });
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}

export default router;