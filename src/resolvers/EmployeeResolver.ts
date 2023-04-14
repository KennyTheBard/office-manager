

import { Resolver, Query, Arg, Mutation, Field, ID, ObjectType } from 'type-graphql';
import { Employee } from '../models';

@ObjectType()
export class EmployeeOutput {
    @Field(() => ID)
    id!: number;

    @Field()
    email!: string;
}

@Resolver(Employee)
export class EmployeeResolver {
    @Query(() => EmployeeOutput, { nullable: true })
    async employee(@Arg('id') id: number): Promise<EmployeeOutput | null> {
        return await Employee.findByPk(id);
    }

    @Query(() => [EmployeeOutput])
    async employees(): Promise<EmployeeOutput[]> {
        return await Employee.findAll();
    }

    @Mutation(() => EmployeeOutput)
    async createEmployee(@Arg('email') email: string): Promise<EmployeeOutput> {
        const employee = await Employee.create({ email });
        await employee.save();
        return employee;
    }
}