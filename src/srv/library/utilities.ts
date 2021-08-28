import * as ncm from '@nestjs/common';

export const error = {
  conflict(): never {
    throw new ncm.ConflictException();
  },
  
  notFound(): never {
    throw new ncm.NotFoundException();
  }
};
