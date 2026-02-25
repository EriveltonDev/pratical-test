import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UploadModule } from '../../upload/module/upload.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    UploadModule
  ],
  controllers: [],
  providers: [],
})  
export class AppModule {}
