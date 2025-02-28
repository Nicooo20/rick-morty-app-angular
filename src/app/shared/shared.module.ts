import { NgModule } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginator } from './custom-paginator';

@NgModule({
    providers: [
        { provide: MatPaginatorIntl, useClass: CustomPaginator }
    ]
})
export class SharedModule { }
