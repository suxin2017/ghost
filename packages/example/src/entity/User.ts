import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";
import { Dao } from 'slow-typeorm';

@Dao
@Entity()
export default class User {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column()
    age!: number;

}
