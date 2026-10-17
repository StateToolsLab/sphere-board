# 作業結果 → map更新候補

このプロンプトと現行map・作業結果をAIへ渡します。自動起動するファイルではありません。

---

最初に `.sphere/WORKFLOW.md` と現行mapを最後まで読んでください。profileはsphere-starter/0.3です。**上位 source がある map は読み取り専用投影です。snapshot・apply・直接 candidate 更新をせず、元の台帳での更新が必要だと報告して止まってください。** 投影へevidence・approvalを付け足してはいけません。

以下はsourceのないStarter mapだけに適用します。mapを再作成せず、新しい作業開始snapshotを基準に、証拠のある差分だけを候補JSONに反映してください。対象ノード、成果物、実施済みテスト、未実施テスト、承認待ち、競合を分けます。

returned / handed_overには実際のevidence、ゲートpassed / passed_with_defectsにはhuman actorによるapproval、cancelledにはreasonと途中の成果の所在を必要とします。decisionやrequiresHumanApproval対象の承認も維持してください。実装終了だけを回収済みとせず、証跡・人間の承認・時刻を捏造しません。最初の基本状態はnot_started / in_progress / returned / cancelledの4語です。その他はspec/starter-map.mdで定義を確認します。

returnは**派生→回収先**です。差し戻しはゲートのsent_backであり、returnの線を追加して代用しません。blockedという状態を作らず、妨げはactiveなblocksの線で残します。ready・currents・stateは別の軸です。

書込み権限とCLIがある場合はsnapshot → 別candidate → validate → diff → hash照合applyの順。権限がなければ候補JSON、変更点、未確認事項、適用手順を返し、「更新済み」と述べません。既存ID・他者のcurrents・owner・座標・lane・derived・planned・関係方向を保持します。新しい関係や担い手の種別を推測しません。

競合時は最新mapを読み、他者の変更を保持して差分を再作成します。古い候補に新hashだけを付けて強制適用しません。candidateのrevision / updatedAt / updatedBy / lastChangeはsnapshotのままにします。

最後に変更ID、state / current / readyの差分、検証結果、保存先、適用後revision、未完了事項を報告してください。
