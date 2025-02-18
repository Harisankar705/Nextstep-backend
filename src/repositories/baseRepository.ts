import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from "mongoose";

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    const entity = new this.model(data);
    return await entity.save();
  }

  async findById(id: string,options?:QueryOptions): Promise<T | null> {
    return await this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(filter).exec();
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<T | null> {
    return await this.model.findByIdAndDelete(id);
  }

  async find(filter: FilterQuery<T>): Promise<T[]> {
    return await this.model.find(filter).exec();
  }
}
