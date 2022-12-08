import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (err) {
      this.handleExceptions(err);
    }
  }

  findAll() {
    return this.pokemonModel;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if (!isNaN(+term)) pokemon = await this.pokemonModel.findOne({ no: term });
    else if (isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    } else pokemon = await this.pokemonModel.findOne({ name: term });

    if (!pokemon) throw new NotFoundException();

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    try {
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (err) {
      this.handleExceptions(err);
    }
  }

  async remove(term: string) {
    const pokemon = await this.findOne(term);

    await pokemon.deleteOne();
  }

  private handleExceptions(err: any) {
    if (err?.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists in DB ${JSON.stringify(err?.keyValue || '')}`,
      );
    }

    console.error('|| ==> Error create <== ||', err);
    throw new InternalServerErrorException('Check server logs');
  }
}
