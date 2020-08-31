import AppError from '../errors/AppError';
import { getRepository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction'
import TransactionsRepository from '../repositories/TransactionsRepository'
import Category from '../models/Category';

interface Request{
  title: string;
  value: number;
  type: "income" | "outcome";
  category: string
}

class CreateTransactionService {
  public async execute({ category, title, type, value }:Request): Promise<Transaction> {
    const transactionsRepository = await getCustomRepository(TransactionsRepository)
    const categoryRepository = await getRepository(Category)

    const { total } = await transactionsRepository.getBalance()

    if(type === 'outcome' && total < value){
      throw new AppError('Cannot create a transaction because yu=ou are poor')
    }

    let categoryUsed = await categoryRepository.findOne({ where: { title: category } })

    if(!categoryUsed){
      categoryUsed = categoryRepository.create({title: category})

      await categoryRepository.save(categoryUsed)
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category: categoryUsed
    })

    await transactionsRepository.save(transaction)

    return transaction

  }
}

export default CreateTransactionService;
