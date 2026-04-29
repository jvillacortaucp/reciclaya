using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.PreOrders.Dtos;

namespace ReciclaYa.Application.PreOrders.Services;

public sealed class QuotationPdfService(IAuthDbContext dbContext) : IQuotationPdfService
{
    public async Task<byte[]> GeneratePreOrderQuotationPdfAsync(
        Guid preOrderId,
        Guid currentUserId,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        var preOrder = await dbContext.PreOrders
            .AsNoTracking()
            .Include(item => item.Buyer)
                .ThenInclude(user => user.Company)
            .Include(item => item.Buyer)
                .ThenInclude(user => user.PersonProfile)
            .Include(item => item.Listing)
                .ThenInclude(listing => listing.Seller)
                    .ThenInclude(user => user.Company)
            .FirstOrDefaultAsync(item => item.Id == preOrderId, cancellationToken);

        if (preOrder is null)
        {
            throw new KeyNotFoundException("PRE_ORDER_NOT_FOUND");
        }

        var isSellerOwner = preOrder.Listing.SellerId == currentUserId;
        var isBuyerOwner = preOrder.BuyerId == currentUserId;
        if (!isAdmin && !isBuyerOwner && !isSellerOwner)
        {
            throw new UnauthorizedAccessException("FORBIDDEN");
        }

        var dto = BuildDto(preOrder);

        QuestPDF.Settings.License = LicenseType.Community;
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(24);
                page.DefaultTextStyle(style => style.FontSize(10));

                page.Header().Column(column =>
                {
                    column.Item().Text("Cotizacion de Pre-Orden").FontSize(20).SemiBold();
                    column.Item().Text($"Codigo: {dto.QuotationCode}");
                    column.Item().Text($"Fecha de emision: {dto.CreatedAt:yyyy-MM-dd HH:mm} UTC");
                    column.Item().Text($"Estado: {dto.Status}");
                });

                page.Content().PaddingVertical(12).Column(column =>
                {
                    column.Spacing(10);
                    column.Item().Element(el => SectionCard(el, "Datos del comprador", body =>
                    {
                        body.Item().Text($"Nombre / Razon social: {dto.BuyerName}");
                        body.Item().Text($"Documento: {ValueOrNotSpecified(dto.BuyerDocument)}");
                        body.Item().Text($"Correo: {ValueOrNotSpecified(dto.BuyerEmail)}");
                        body.Item().Text($"Direccion: {ValueOrNotSpecified(dto.BuyerAddress)}");
                    }));

                    column.Item().Element(el => SectionCard(el, "Datos del producto/residuo", body =>
                    {
                        body.Item().Text($"Nombre: {dto.ProductName}");
                        body.Item().Text($"Descripcion: {dto.ProductDescription}");
                        body.Item().Text($"Tipo de residuo: {dto.WasteType}");
                        body.Item().Text($"Unidad de medida: {dto.UnitMeasure}");
                        body.Item().Text($"Ubicacion: {dto.Location}");
                        body.Item().Text($"Modalidad de entrega: {dto.DeliveryMode}");
                    }));

                    column.Item().Element(el => SectionCard(el, "Datos del vendedor", body =>
                    {
                        body.Item().Text($"Nombre / Razon social: {dto.SellerName}");
                        body.Item().Text($"Ubicacion: {ValueOrNotSpecified(dto.SellerLocation)}");
                    }));

                    column.Item().Element(el => SectionCard(el, "Detalle de cotizacion", body =>
                    {
                        body.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(3);
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(1.2f);
                                columns.RelativeColumn(1.2f);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(HeaderCell).Text("Producto");
                                header.Cell().Element(HeaderCell).Text("Cantidad");
                                header.Cell().Element(HeaderCell).Text("Unidad");
                                header.Cell().Element(HeaderCell).Text("Precio unitario");
                                header.Cell().Element(HeaderCell).Text("Total");
                            });

                            table.Cell().Element(BodyCell).Text(dto.ProductName);
                            table.Cell().Element(BodyCell).Text(dto.Quantity.ToString("0.###"));
                            table.Cell().Element(BodyCell).Text(dto.UnitMeasure);
                            table.Cell().Element(BodyCell).Text($"{CurrencySymbol(dto.Currency)} {dto.UnitPrice:0.00}");
                            table.Cell().Element(BodyCell).Text($"{CurrencySymbol(dto.Currency)} {dto.TotalAmount:0.00}");
                        });
                    }));

                    column.Item().AlignRight().Element(el => SectionCard(el.Width(220), "Resumen", body =>
                    {
                        body.Item().Text($"Subtotal: {CurrencySymbol(dto.Currency)} {dto.Subtotal:0.00}");
                        body.Item().Text($"Logistica: {CurrencySymbol(dto.Currency)} {dto.LogisticsFee:0.00}");
                        body.Item().Text($"Comision admin: {CurrencySymbol(dto.Currency)} {dto.AdminFee:0.00}");
                        body.Item().Text($"Total: {CurrencySymbol(dto.Currency)} {dto.TotalAmount:0.00}")
                            .SemiBold();
                        body.Item().Text($"Moneda: {dto.Currency}");
                    }));

                    if (!string.IsNullOrWhiteSpace(dto.Notes))
                    {
                        column.Item().Element(el => SectionCard(el, "Observaciones", body =>
                        {
                            body.Item().Text(dto.Notes!);
                        }));
                    }

                    column.Item().PaddingTop(8).Text(
                        "Este documento es una cotizacion generada automaticamente y no representa una factura.");
                    column.Item().Text(
                        "La disponibilidad del producto puede variar hasta la confirmacion de la operacion.");
                });

                page.Footer().AlignCenter().Text(
                    $"ReciclaYa - Generado el {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
            });
        });

        return document.GeneratePdf();
    }

    private static PreOrderQuotationPdfDto BuildDto(Domain.Entities.PreOrder preOrder)
    {
        var buyerName = preOrder.Buyer.Company?.BusinessName;
        if (string.IsNullOrWhiteSpace(buyerName) && preOrder.Buyer.PersonProfile is not null)
        {
            buyerName = $"{preOrder.Buyer.PersonProfile.FirstName} {preOrder.Buyer.PersonProfile.LastName}".Trim();
        }

        buyerName ??= preOrder.Buyer.FullName;
        var buyerDocument = preOrder.Buyer.Company?.Ruc ?? preOrder.Buyer.PersonProfile?.DocumentNumber;
        var buyerAddress = preOrder.Buyer.Company?.Address ?? preOrder.Buyer.PersonProfile?.Address;
        var sellerName = preOrder.Listing.Seller.Company?.BusinessName ?? preOrder.Listing.Seller.FullName;

        return new PreOrderQuotationPdfDto(
            preOrder.Id,
            $"PO-{preOrder.Id.ToString()[..8].ToUpperInvariant()}",
            preOrder.CreatedAt,
            preOrder.Status.ToString(),
            buyerName,
            EmptyToNull(buyerDocument),
            EmptyToNull(preOrder.Buyer.Email),
            EmptyToNull(buyerAddress),
            sellerName,
            EmptyToNull(preOrder.Listing.Location),
            preOrder.Listing.SpecificResidue,
            EmptyToNull(preOrder.Listing.Description) ?? "-",
            ToResidueTypeLabel(preOrder.Listing.WasteType),
            ToUnitLabel(preOrder.Listing.Unit),
            ToDeliveryModeLabel(preOrder.Listing.DeliveryMode),
            preOrder.Listing.Location,
            preOrder.Quantity,
            preOrder.UnitPrice,
            preOrder.Subtotal,
            preOrder.LogisticsFee,
            preOrder.AdminFee,
            preOrder.Total,
            preOrder.Currency,
            EmptyToNull(preOrder.Notes));
    }

    private static void SectionCard(IContainer container, string title, Action<ColumnDescriptor> content)
    {
        container
            .Border(1)
            .BorderColor(Colors.Grey.Lighten2)
            .Padding(10)
            .Column(column =>
            {
                column.Spacing(4);
                column.Item().Text(title).SemiBold().FontSize(11);
                content(column);
            });
    }

    private static IContainer HeaderCell(IContainer container)
    {
        return container
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Lighten2)
            .PaddingVertical(4)
            .DefaultTextStyle(style => style.SemiBold().FontSize(9));
    }

    private static IContainer BodyCell(IContainer container)
    {
        return container
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Lighten3)
            .PaddingVertical(4)
            .DefaultTextStyle(style => style.FontSize(9));
    }

    private static string CurrencySymbol(string currency)
    {
        return string.Equals(currency, "PEN", StringComparison.OrdinalIgnoreCase) ? "S/" : "$";
    }

    private static string ValueOrNotSpecified(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? "No especificado" : value;
    }

    private static string ToResidueTypeLabel(string value)
    {
        return value switch
        {
            "organic" => "Organico",
            "inorganic" => "Inorganico",
            _ => value
        };
    }

    private static string ToUnitLabel(string value)
    {
        return value switch
        {
            "tons" => "Ton",
            "kg" => "Kg",
            "m3" => "m3",
            _ => value
        };
    }

    private static string ToDeliveryModeLabel(string value)
    {
        return value switch
        {
            "pickup" => "Recojo",
            "delivery" => "Entrega",
            _ => value
        };
    }

    private static string? EmptyToNull(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value;
    }
}
