import 'package:flutter/material.dart';
import '../models/rank_model.dart';
import '../theme/app_theme.dart';

class RankListCard extends StatelessWidget {
  final RankEntry entry;

  const RankListCard({super.key, required this.entry});

  Color _getRankColor() {
    if (entry.rank == 1) return Colors.amber;
    if (entry.rank == 2) return Colors.blueGrey.shade300;
    if (entry.rank == 3) return AppTheme.duoOrange;
    return Colors.white54;
  }

  Color _getBgColor() {
    if (entry.rank == 1) return Colors.amber.withOpacity(0.15);
    if (entry.rank == 2) return Colors.blueGrey.withOpacity(0.15);
    if (entry.rank == 3) return AppTheme.duoOrange.withOpacity(0.15);
    return AppTheme.surface;
  }

  @override
  Widget build(BuildContext context) {
    final color = _getRankColor();
    final isTop3 = entry.rank <= 3;
    final bgColor = _getBgColor();

    // Determine the overlapping width dynamically
    int displayCount = entry.users.length > 3 ? 3 : entry.users.length;
    double avatarWidth = 40.0 + (displayCount > 1 ? (displayCount - 1) * 20.0 : 0);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isTop3 ? color.withOpacity(0.6) : Colors.white12, width: isTop3 ? 2 : 1),
        boxShadow: isTop3 ? [
          BoxShadow(
            color: color.withOpacity(0.15),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ] : [],
      ),
      child: Row(
        children: [
          // Rank Identity
          SizedBox(
            width: 40,
            child: Text(
              '#${entry.rank}',
              style: TextStyle(
                fontSize: isTop3 ? 20 : 16,
                fontWeight: FontWeight.w900,
                color: color,
              ),
            ),
          ),
          
          // Overlapping Avatars for Ties
          SizedBox(
            width: avatarWidth,
            height: 40,
            child: Stack(
              children: List.generate(displayCount, (index) {
                final user = entry.users[index];
                return Positioned(
                  left: index * 20.0,
                  child: Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: isTop3 ? color.withOpacity(0.8) : AppTheme.surface, width: 2),
                    ),
                    child: CircleAvatar(
                      radius: 18,
                      backgroundColor: AppTheme.duoBlue,
                      backgroundImage: user.photoUrl != null ? NetworkImage(user.photoUrl!) : null,
                      child: user.photoUrl == null 
                          ? Text(user.name[0].toUpperCase(), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white))
                          : null,
                    ),
                  ),
                );
              }),
            ),
          ),
          const SizedBox(width: 12),
          
          // Group Data
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  entry.users.map((u) => u.name).join(', '),
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: isTop3 ? Colors.white : Colors.white70,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (entry.users.length > 1)
                  Text(
                    '${entry.users.length} players tied',
                    style: TextStyle(fontSize: 11, color: isTop3 ? color.withOpacity(0.9) : Colors.white54, fontWeight: FontWeight.bold),
                  ),
              ],
            ),
          ),
          
          // XP Highlights
          Text(
            '${entry.xp} XP',
            style: TextStyle(
              fontWeight: FontWeight.w900,
              fontSize: 16,
              color: isTop3 ? color : Colors.white54,
            ),
          ),
        ],
      ),
    );
  }
}