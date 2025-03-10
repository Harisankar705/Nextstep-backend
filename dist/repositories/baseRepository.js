"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        const entity = new this.model(data);
        return await entity.save();
    }
    async findById(id, options) {
        return await this.model.findById(id).exec();
    }
    async findOne(filter) {
        return await this.model.findOne(filter).exec();
    }
    async update(id, data) {
        return await this.model.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }
    async find(filter) {
        return await this.model.find(filter).exec();
    }
}
exports.BaseRepository = BaseRepository;
