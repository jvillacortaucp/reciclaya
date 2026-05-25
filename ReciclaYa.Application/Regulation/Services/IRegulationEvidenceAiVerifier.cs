using ReciclaYa.Application.Regulation.Dtos;

namespace ReciclaYa.Application.Regulation.Services;

public interface IRegulationEvidenceAiVerifier
{
    Task<RegulationEvidenceVerificationResultDto?> VerifyAsync(
        RegulationEvidenceVerificationRequestDto request,
        CancellationToken cancellationToken = default);
}

