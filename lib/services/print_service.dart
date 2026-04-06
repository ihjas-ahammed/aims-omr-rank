import 'dart:io';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import '../models/rank_model.dart';

class PrintService {
  static Future<File> generateRankListPdf(List<RankEntry> entries) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build: (pw.Context context) {
          return [
            pw.Text('Leaderboard Ranking', style: pw.TextStyle(fontSize: 28, fontWeight: pw.FontWeight.bold, color: PdfColors.blue800)),
            pw.SizedBox(height: 8),
            pw.Text('Global Player Statistics', style: pw.TextStyle(fontSize: 14, color: PdfColors.grey600)),
            pw.SizedBox(height: 24),
            
            ...entries.map((e) {
              final isTop3 = e.rank <= 3;
              
              PdfColor bgColor = PdfColors.white;
              PdfColor textColor = PdfColors.grey800;
              PdfColor avatarColor = PdfColors.blueGrey800;
              
              // Top ranks highlighted in Printable mode exactly as requested
              if (e.rank == 1) {
                bgColor = PdfColors.amber100;
                textColor = PdfColors.amber900;
                avatarColor = PdfColors.amber700;
              } else if (e.rank == 2) {
                bgColor = PdfColors.blueGrey100;
                textColor = PdfColors.blueGrey900;
                avatarColor = PdfColors.blueGrey700;
              } else if (e.rank == 3) {
                bgColor = PdfColors.orange100;
                textColor = PdfColors.orange900;
                avatarColor = PdfColors.orange700;
              }

              int displayCount = e.users.length > 3 ? 3 : e.users.length;
              double avatarWidth = 36.0 + (displayCount > 1 ? (displayCount - 1) * 20.0 : 0);

              return pw.Container(
                margin: const pw.EdgeInsets.only(bottom: 12),
                padding: const pw.EdgeInsets.all(12),
                decoration: pw.BoxDecoration(
                  color: bgColor,
                  borderRadius: const pw.BorderRadius.all(pw.Radius.circular(12)),
                  border: pw.Border.all(color: isTop3 ? textColor : PdfColors.grey300, width: isTop3 ? 2 : 1),
                ),
                child: pw.Row(
                  crossAxisAlignment: pw.CrossAxisAlignment.center,
                  children: [
                    pw.Container(
                      width: 40,
                      child: pw.Text('#${e.rank}', style: pw.TextStyle(fontSize: isTop3 ? 18 : 14, fontWeight: pw.FontWeight.bold, color: textColor)),
                    ),
                    pw.SizedBox(
                      width: avatarWidth,
                      height: 36,
                      child: pw.Stack(
                        children: List.generate(displayCount, (index) {
                          final user = e.users[index];
                          return pw.Positioned(
                            left: index * 20.0,
                            child: pw.Container(
                              width: 36, height: 36,
                              decoration: pw.BoxDecoration(
                                shape: pw.BoxShape.circle,
                                color: avatarColor,
                                border: pw.Border.all(color: bgColor, width: 2),
                              ),
                              alignment: pw.Alignment.center,
                              child: pw.Text(user.name[0].toUpperCase(), style: pw.TextStyle(color: PdfColors.white, fontWeight: pw.FontWeight.bold, fontSize: 14)),
                            )
                          );
                        })
                      )
                    ),
                    pw.SizedBox(width: 16),
                    pw.Expanded(
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text(e.users.map((u) => u.name).join(', '), style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold, color: textColor)),
                          if (e.users.length > 1)
                            pw.Text('${e.users.length} players tied', style: pw.TextStyle(fontSize: 10, color: isTop3 ? textColor : PdfColors.grey600)),
                        ]
                      )
                    ),
                    pw.Text('${e.xp} XP', style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold, color: textColor)),
                  ],
                ),
              );
            }),
          ];
        },
      ),
    );

    final output = await getTemporaryDirectory();
    final file = File("${output.path}/leaderboard_ranking.pdf");
    await file.writeAsBytes(await pdf.save());
    return file;
  }
}