import { Bell, Check, X, Info, CheckCircle, AlertTriangle, AlertCircle, Trash2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

export default function NotificationDropdown({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="absolute left-0 top-full mt-2 w-96 bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-lg shadow-lg z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-[hsl(var(--foreground))]" />
          <h3 className="font-semibold text-[hsl(var(--foreground))]">الإشعارات</h3>
          {unreadCount > 0 && (
            <span className="bg-[hsl(var(--primary))] text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[hsl(var(--accent))] rounded transition-colors"
        >
          <X className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        </button>
      </div>

      {/* Mark all as read button */}
      {unreadCount > 0 && (
        <div className="px-4 py-2 border-b border-[hsl(var(--border))]">
          <button
            onClick={markAllAsRead}
            className="text-sm text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
          >
            <Check className="h-3 w-3" />
            تحديد الكل كمقروء
          </button>
        </div>
      )}

      {/* Notifications list */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
            <p className="text-[hsl(var(--muted-foreground))]">لا توجد إشعارات</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors ${
                !notification.read ? 'bg-[hsl(var(--accent))]/30' : ''
              }`}
            >
              <div className="flex gap-3">
                <div className={`p-2 rounded-full ${getTypeStyles(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <span className="h-2 w-2 bg-[hsl(var(--primary))] rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                    {formatDate(notification.timestamp)}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 hover:bg-[hsl(var(--border))] rounded transition-colors"
                      title="تحديد كمقروء"
                    >
                      <Check className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                    </button>
                  )}
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="p-1 hover:bg-[hsl(var(--border))] rounded transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-[hsl(var(--border))] text-center">
          <button className="text-sm text-[hsl(var(--primary))] hover:underline">
            عرض جميع الإشعارات
          </button>
        </div>
      )}
    </div>
  );
}
