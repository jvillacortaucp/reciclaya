using System.Text.RegularExpressions;

namespace ReciclaYa.Application.Auth.Services;

internal static partial class InputValidation
{
    private static readonly Regex HtmlOrScriptPattern = HtmlRegex();
    private static readonly Regex BusinessNamePattern = new(@"^[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9&.,\- ]*[A-Za-zÀ-ÿ0-9)]$", RegexOptions.Compiled);
    private static readonly Regex AddressPattern = new(@"^[A-Za-zÀ-ÿ0-9#/,.\- ]*[A-Za-zÀ-ÿ0-9)]$", RegexOptions.Compiled);
    private static readonly Regex PersonNamePattern = new(@"^[A-Za-zÀ-ÿ]+(?:[ '\-][A-Za-zÀ-ÿ]+)*$", RegexOptions.Compiled);
    private static readonly Regex PositionPattern = new(@"^[A-Za-zÀ-ÿ]+(?:[ \-][A-Za-zÀ-ÿ]+)*$", RegexOptions.Compiled);
    private static readonly Regex PhonePattern = new(@"^\+?\d{7,15}$", RegexOptions.Compiled);
    private static readonly Regex PostalCodePattern = new(@"^\d{4,10}$", RegexOptions.Compiled);
    private static readonly Regex DocumentPattern = new(@"^\d{8,12}$", RegexOptions.Compiled);
    private static readonly Regex RucPattern = new(@"^\d{11}$", RegexOptions.Compiled);

    public static string NormalizeText(string? value)
    {
        return Regex.Replace((value ?? string.Empty).Trim(), @"\s{2,}", " ");
    }

    public static bool ContainsSuspiciousContent(string? value)
    {
        return !string.IsNullOrWhiteSpace(value) && HtmlOrScriptPattern.IsMatch(value);
    }

    public static string? ValidateCompanyField(string value, string fieldName)
    {
        var normalized = NormalizeText(value);
        if (string.IsNullOrWhiteSpace(normalized))
        {
            return $"{fieldName} is required.";
        }

        if (ContainsSuspiciousContent(normalized))
        {
            return $"{fieldName} contains invalid content.";
        }

        return null;
    }

    public static string? ValidateRuc(string value)
    {
        var validation = ValidateCompanyField(value, "RUC");
        if (validation is not null)
        {
            return validation;
        }

        return RucPattern.IsMatch(NormalizeText(value)) ? null : "RUC must contain 11 digits.";
    }

    public static string? ValidateBusinessName(string value)
    {
        var validation = ValidateCompanyField(value, "Business name");
        if (validation is not null)
        {
            return validation;
        }

        return BusinessNamePattern.IsMatch(NormalizeText(value))
            ? null
            : "Business name contains invalid characters.";
    }

    public static string? ValidateAddress(string value)
    {
        var validation = ValidateCompanyField(value, "Address");
        if (validation is not null)
        {
            return validation;
        }

        return AddressPattern.IsMatch(NormalizeText(value))
            ? null
            : "Address contains invalid characters.";
    }

    public static string? ValidatePhone(string value)
    {
        var validation = ValidateCompanyField(value, "Mobile phone");
        if (validation is not null)
        {
            return validation;
        }

        return PhonePattern.IsMatch(NormalizeText(value))
            ? null
            : "Mobile phone must contain only digits and an optional leading plus sign.";
    }

    public static string? ValidatePostalCode(string value)
    {
        var validation = ValidateCompanyField(value, "Postal code");
        if (validation is not null)
        {
            return validation;
        }

        return PostalCodePattern.IsMatch(NormalizeText(value))
            ? null
            : "Postal code must contain only digits.";
    }

    public static string? ValidatePersonName(string value, string fieldName)
    {
        var validation = ValidateCompanyField(value, fieldName);
        if (validation is not null)
        {
            return validation;
        }

        return PersonNamePattern.IsMatch(NormalizeText(value))
            ? null
            : $"{fieldName} contains invalid characters.";
    }

    public static string? ValidatePosition(string value)
    {
        var validation = ValidateCompanyField(value, "Position");
        if (validation is not null)
        {
            return validation;
        }

        return PositionPattern.IsMatch(NormalizeText(value))
            ? null
            : "Position contains invalid characters.";
    }

    public static string? ValidateDocumentNumber(string value)
    {
        var validation = ValidateCompanyField(value, "Document number");
        if (validation is not null)
        {
            return validation;
        }

        return DocumentPattern.IsMatch(NormalizeText(value))
            ? null
            : "Document number must contain between 8 and 12 digits.";
    }

    public static string? ValidateEmail(string value)
    {
        var validation = ValidateCompanyField(value, "Email");
        if (validation is not null)
        {
            return validation;
        }

        try
        {
            _ = new System.Net.Mail.MailAddress(NormalizeText(value));
            return null;
        }
        catch
        {
            return "Email format is invalid.";
        }
    }

    [GeneratedRegex(@"<[^>]*>|javascript:|data:text/html|on\w+\s*=|<script\b", RegexOptions.IgnoreCase)]
    private static partial Regex HtmlRegex();
}
