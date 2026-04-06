import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:share_plus/share_plus.dart';
import '../models/rank_model.dart';
import '../theme/app_theme.dart';
import '../widgets/rank_list_card.dart';
import '../services/print_service.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  // Utilizing Dummy Data to demonstrate the multi-player tie logic on higher ranks
  final List<RankEntry> dummyData = [
    RankEntry(
      rank: 1, 
      xp: 15400, 
      users: [RankUser(id: '1', name: 'Alice'), RankUser(id: '2', name: 'Bob')]
    ),
    RankEntry(
      rank: 2, 
      xp: 14200, 
      users: [RankUser(id: '3', name: 'Charlie')]
    ),
    RankEntry(
      rank: 3, 
      xp: 13800, 
      users: [RankUser(id: '4', name: 'Diana'), RankUser(id: '5', name: 'Eve'), RankUser(id: '6', name: 'Frank')]
    ),
    RankEntry(
      rank: 4, 
      xp: 12000, 
      users: [RankUser(id: '7', name: 'Grace')]
    ),
    RankEntry(
      rank: 5, 
      xp: 11500, 
      users: [RankUser(id: '8', name: 'Hank'), RankUser(id: '9', name: 'Ivy')]
    ),
    RankEntry(
      rank: 6, 
      xp: 9800, 
      users: [RankUser(id: '10', name: 'Jack')]
    ),
  ];

  Future<void> _exportPdf() async {
    try {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Generating Printable PDF...')));
      final file = await PrintService.generateRankListPdf(dummyData);
      await Share.shareXFiles([XFile(file.path)], text: 'Check out the current leaderboard!');
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error generating PDF: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Leaderboard', style: TextStyle(fontWeight: FontWeight.w900)),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.printer, color: AppTheme.duoBlue),
            tooltip: 'Export/Print',
            onPressed: _exportPdf,
          )
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(24),
        itemCount: dummyData.length,
        itemBuilder: (context, index) {
          return RankListCard(entry: dummyData[index]);
        },
      ),
    );
  }
}