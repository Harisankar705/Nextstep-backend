import mongoose, {Model, Document, FilterQuery, UpdateQuery } from "mongoose";

export class BaseRepository<T extends Document>
{
    constructor(protected readonly model:Model<T>){}
    async create(data:Partial<T>):Promise<T>
    {
        const entity=new this.model(data)
        return await entity.save()
    }
   
    async findById(id:string):Promise<T|null>
    {
        return await this.model.findById(id)
    }
    async findOne(filter:FilterQuery<T>):Promise<T|null>
    {
        return await this.model.findOne(filter)
    }
    async find(filter:FilterQuery<T>):Promise<T[]>{
        return await this.model.find(filter).exec()
    }
    async update(id:string,data:UpdateQuery<T>):Promise<T|null>
    {
        return await this.model.findByIdAndUpdate(id,data,{new:true})
    }
    async populateQuery(
        query: mongoose.Query<T[], T>,
        paths: string | string[],
        select?: string
    ): Promise<T[]> {
        return await query.populate(paths, select);
    }
    async delete(id:string):Promise<T|null>
    {
        return await this.model.findByIdAndUpdate(id)
    }
}