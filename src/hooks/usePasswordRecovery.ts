import { useMutation } from '@tanstack/react-query';
import { UsersService } from '@/services/users.service';
import { SendTokenToRecoveryPasswordDto, ResetPasswordDto } from '@/types/users';
import { toast } from 'sonner';

export const useSendRecoveryToken = () => {
    return useMutation({
        mutationFn: (dto: SendTokenToRecoveryPasswordDto) => UsersService.sendTokenToRecoveryPassword(dto),
        onSuccess: () => {
            toast.success('Correo de recuperación enviado. Revisa tu bandeja de entrada.');
        },
        onError: (error: any) => {
            console.error('Error sending recovery token:', error);
            toast.error(error.response?.data?.message || 'Error al enviar el correo de recuperación');
        },
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: (dto: ResetPasswordDto) => UsersService.resetPassword(dto),
        onSuccess: () => {
            toast.success('Contraseña restablecida correctamente');
        },
        onError: (error: any) => {
            console.error('Error resetting password:', error);
            toast.error(error.response?.data?.message || 'Error al restablecer la contraseña');
        },
    });
};
