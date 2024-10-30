import { AccessTokenGuard } from '@/auth/guards/access-token.guard';
import { RequestWithUser } from '@/auth/interfaces/request.interface';
import {
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AzureService } from './azure.service';

@ApiTags('azure')
@Controller('azure')
export class AzureController {
  constructor(private readonly azureService: AzureService) {}
  @Get('image/:participantId')
  @Header('Content-Type', 'image/webp')
  @ApiOperation({ summary: 'Get image from Azure by name' })
  @ApiQuery({
    name: 'name',
    type: String,
    description: 'Name of the image file in Azure',
  })
  @ApiParam({
    name: 'participantId',
    required: true,
    description: 'participant Id',
  })
  @ApiResponse({ status: 200, description: 'Returns an image stream' })
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  async read(
    @Res() res: any,
    @Query('name') name: string,
    @Req() req: RequestWithUser,
    @Param('participantId') participantId: string,
  ) {
    const data = await this.azureService.readStream(
      name,
      participantId,
      req.user,
    );
    return data.pipe(res);
  }

  @Delete(':participantId')
  @ApiOperation({ summary: 'Delete image from Azure by name' })
  @ApiQuery({
    name: 'name',
    type: String,
    description: 'Name of the image file to delete',
  })
  @ApiParam({
    name: 'participantId',
    required: true,
    description: 'participant Id',
  })
  @ApiResponse({ status: 200, description: 'Deletes the specified image' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async delete(
    @Query('name') name,
    @Req() req: RequestWithUser,
    @Param('participantId') participantId: string,
  ) {
    const data = await this.azureService.delete(name, participantId, req.user);
    return data;
  }

  @Get('images')
  @ApiOperation({
    summary: 'Get all images from Azure container (only for development)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all images',
  })
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  async readAll() {
    const data = await this.azureService.readAll();
    console.log(data, 'data');
    return null;
  }
}