import { MatPaginatorIntl } from '@angular/material/paginator';

export class CustomPaginator extends MatPaginatorIntl {
    override itemsPerPageLabel = 'Elementos por página:';
    override nextPageLabel = 'Siguiente';
    override previousPageLabel = 'Anterior';
    override firstPageLabel = 'Primera página';
    override lastPageLabel = 'Última página';

    override getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
            return `No hay elementos disponibles`;
        }
        const startIndex = page * pageSize;
        const endIndex = Math.min(startIndex + pageSize, length);
        return `Mostrando ${startIndex + 1} - ${endIndex} de ${length}`;
    };
}